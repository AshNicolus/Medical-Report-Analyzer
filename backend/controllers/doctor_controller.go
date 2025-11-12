package controllers

import (
	"context"
	"net/http"
	"time"

	"github.com/Aashishvatwani/Medical-Report-Analyzer/config"
	"github.com/Aashishvatwani/Medical-Report-Analyzer/models"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type DoctorController struct{}

func NewDoctorController() *DoctorController {
	return &DoctorController{}
}

// GetAllReports returns all reports (can filter by status)
// GET /api/doctor/reports?status=pending
func (ctrl *DoctorController) GetAllReports(c *gin.Context) {
	status := c.Query("status")

	collection := config.GetCollection("reports")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	filter := bson.M{}
	if status != "" {
		filter["status"] = status
	}

	cursor, err := collection.Find(ctx, filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch reports"})
		return
	}
	defer cursor.Close(ctx)

	var reports []models.Report
	if err = cursor.All(ctx, &reports); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to decode reports"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"count":   len(reports),
		"reports": reports,
	})
}

// GetReportByID returns detailed report view for doctor
// GET /api/doctor/reports/:id
func (ctrl *DoctorController) GetReportByID(c *gin.Context) {
	reportID := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(reportID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid report id"})
		return
	}

	collection := config.GetCollection("reports")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var report models.Report
	err = collection.FindOne(ctx, bson.M{"_id": objID}).Decode(&report)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "report not found"})
		return
	}

	c.JSON(http.StatusOK, report)
}

// SubmitReview allows doctor to review and mark report
// POST /api/doctor/reports/:id/review
// Body: { "doctor_id": "xxx", "notes": "..." }
func (ctrl *DoctorController) SubmitReview(c *gin.Context) {
	reportID := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(reportID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid report id"})
		return
	}

	var req struct {
		DoctorID string `json:"doctor_id" binding:"required"`
		Notes    string `json:"notes"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	doctorObjID, err := primitive.ObjectIDFromHex(req.DoctorID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid doctor_id"})
		return
	}

	review := models.DoctorReview{
		ReviewedBy: doctorObjID,
		ReviewedAt: time.Now(),
		Notes:      req.Notes,
	}

	collection := config.GetCollection("reports")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	update := bson.M{
		"$set": bson.M{
			"doctor_review": review,
			"status":        "reviewed",
			"updated_at":    time.Now(),
		},
	}

	result, err := collection.UpdateOne(ctx, bson.M{"_id": objID}, update)
	if err != nil || result.MatchedCount == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update report"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Review submitted successfully",
	})
}

// EditAnalysis allows doctor to edit AI analysis when confidence < 90%
// PUT /api/doctor/reports/:id/edit
// Body: { "doctor_id": "xxx", "edited_fields": {...}, "notes": "..." }
func (ctrl *DoctorController) EditAnalysis(c *gin.Context) {
	reportID := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(reportID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid report id"})
		return
	}

	var req struct {
		DoctorID     string                 `json:"doctor_id" binding:"required"`
		EditedFields map[string]interface{} `json:"edited_fields" binding:"required"`
		Notes        string                 `json:"notes"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	doctorObjID, err := primitive.ObjectIDFromHex(req.DoctorID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid doctor_id"})
		return
	}

	// First, get the report to check confidence
	collection := config.GetCollection("reports")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var report models.Report
	err = collection.FindOne(ctx, bson.M{"_id": objID}).Decode(&report)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "report not found"})
		return
	}

	// Check if confidence is < 90%
	if report.AIAnalysis.ConfidenceScore >= 90.0 {
		c.JSON(http.StatusForbidden, gin.H{
			"error":              "Cannot edit - confidence score is >= 90%",
			"current_confidence": report.AIAnalysis.ConfidenceScore,
		})
		return
	}

	// Create feedback record
	feedback := models.Feedback{
		ID:                primitive.NewObjectID(),
		ReportID:          objID,
		DoctorID:          doctorObjID,
		OriginalAnalysis:  report.AIAnalysis,
		CorrectedAnalysis: req.EditedFields,
		AccuracyScore:     report.AIAnalysis.ConfidenceScore,
		Comments:          req.Notes,
		CreatedAt:         time.Now(),
	}

	feedbackCollection := config.GetCollection("feedback")
	_, err = feedbackCollection.InsertOne(ctx, feedback)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save feedback"})
		return
	}

	// Update report with doctor review
	review := models.DoctorReview{
		ReviewedBy:   doctorObjID,
		ReviewedAt:   time.Now(),
		EditedFields: req.EditedFields,
		Notes:        req.Notes,
	}

	update := bson.M{
		"$set": bson.M{
			"doctor_review": review,
			"status":        "edited",
			"updated_at":    time.Now(),
		},
	}

	_, err = collection.UpdateOne(ctx, bson.M{"_id": objID}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update report"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":     true,
		"message":     "Analysis edited and feedback saved",
		"feedback_id": feedback.ID.Hex(),
	})
}

// GetPatients returns list of all patients (simplified)
// GET /api/doctor/patients
func (ctrl *DoctorController) GetPatients(c *gin.Context) {
	collection := config.GetCollection("patients")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch patients"})
		return
	}
	defer cursor.Close(ctx)

	var patients []models.Patient
	if err = cursor.All(ctx, &patients); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to decode patients"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":  true,
		"count":    len(patients),
		"patients": patients,
	})
}

// GetPatientReports returns all reports for a specific patient
// GET /api/doctor/patients/:patient_id/reports
func (ctrl *DoctorController) GetPatientReports(c *gin.Context) {
	patientID := c.Param("patient_id")
	objID, err := primitive.ObjectIDFromHex(patientID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid patient id"})
		return
	}

	collection := config.GetCollection("reports")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := collection.Find(ctx, bson.M{"patient_id": objID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch reports"})
		return
	}
	defer cursor.Close(ctx)

	var reports []models.Report
	if err = cursor.All(ctx, &reports); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to decode reports"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":    true,
		"patient_id": patientID,
		"count":      len(reports),
		"reports":    reports,
	})
}
