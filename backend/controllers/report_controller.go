package controllers

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/Aashishvatwani/Medical-Report-Analyzer/config"
	"github.com/Aashishvatwani/Medical-Report-Analyzer/models"
	"github.com/Aashishvatwani/Medical-Report-Analyzer/services"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// ReportController handles patient report uploads and retrieval
type ReportController struct{}

func NewReportController() *ReportController {
	return &ReportController{}
}

// UploadReport handles multipart PDF upload
// POST /api/patient/upload
func (ctrl *ReportController) UploadReport(c *gin.Context) {
	// Optional patient_id in form
	patientIDStr := c.PostForm("patient_id")
	var patientObjID primitive.ObjectID
	if patientIDStr != "" {
		objID, err := primitive.ObjectIDFromHex(patientIDStr)
		if err == nil {
			patientObjID = objID
		}
	}

	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "file is required"})
		return
	}
	defer file.Close()

	// Validate extension
	ext := filepath.Ext(header.Filename)
	if ext == "" || (ext != ".pdf" && ext != ".PDF") {
		c.JSON(http.StatusBadRequest, gin.H{"error": "only PDF files are allowed"})
		return
	}

	// Save to a temp path
	tmpDir := os.TempDir()
	filename := fmt.Sprintf("report_%d_%s", time.Now().UnixNano(), header.Filename)
	storedPath := filepath.Join(tmpDir, filename)
	out, err := os.Create(storedPath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save file"})
		return
	}
	defer out.Close()

	_, err = io.Copy(out, file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to write file"})
		return
	}

	// Call analysis service
	analysis, err := services.AnalyzePDFReport(storedPath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "analysis failed", "details": err.Error()})
		return
	}

	// Persist report to DB
	report := models.Report{
		ID:          primitive.NewObjectID(),
		PatientID:   patientObjID,
		PDFPath:     storedPath,
		PDFFileName: header.Filename,
		UploadedAt:  time.Now(),
		AIAnalysis:  *analysis,
		Status:      "pending",
		UpdatedAt:   time.Now(),
	}

	collection := config.GetCollection("reports")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err = collection.InsertOne(ctx, report)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save report"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":   true,
		"report_id": report.ID.Hex(),
		"analysis":  report.AIAnalysis,
	})
}

// GetReport returns structured analysis for a report
// GET /api/patient/reports/:id
func (ctrl *ReportController) GetReport(c *gin.Context) {
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

	c.JSON(http.StatusOK, gin.H{
		"report_id":    report.ID.Hex(),
		"pdf_filename": report.PDFFileName,
		"uploaded_at":  report.UploadedAt,
		"analysis":     report.AIAnalysis,
	})
}

// DownloadReport serves the PDF file for download
// GET /api/patient/reports/:id/download
func (ctrl *ReportController) DownloadReport(c *gin.Context) {
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

	// Check if file exists
	if _, err := os.Stat(report.PDFPath); os.IsNotExist(err) {
		c.JSON(http.StatusNotFound, gin.H{"error": "PDF file not found on server"})
		return
	}

	// Set headers for file download
	c.Header("Content-Description", "File Transfer")
	c.Header("Content-Transfer-Encoding", "binary")
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=%s", report.PDFFileName))
	c.Header("Content-Type", "application/pdf")

	// Serve the file
	c.File(report.PDFPath)
}

// ListReports returns all reports for a patient
// POST /api/patient/reports
// Body: { "patient_id": "xxx" }
func (ctrl *ReportController) ListReports(c *gin.Context) {
	var req struct {
		PatientID string `json:"patient_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "patient_id is required"})
		return
	}

	patientObjID, err := primitive.ObjectIDFromHex(req.PatientID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid patient_id"})
		return
	}

	collection := config.GetCollection("reports")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Find all reports for this patient
	cursor, err := collection.Find(ctx, bson.M{"patient_id": patientObjID})
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

	// Format response to match frontend structure
	type DoctorInfo struct {
		Name           string `json:"name"`
		Specialization string `json:"specialization"`
	}

	type ReportResponse struct {
		ID           string             `json:"id"`
		Name         string             `json:"name"`
		Date         string             `json:"date"`
		Status       string             `json:"status"`
		Confidence   *float64           `json:"confidence"`
		Analysis     *models.AIAnalysis `json:"analysis"`
		DoctorReview *struct {
			ReviewedBy   string                 `json:"reviewed_by"`
			ReviewedAt   time.Time              `json:"reviewed_at"`
			Notes        string                 `json:"notes"`
			DoctorInfo   *DoctorInfo            `json:"doctor_info,omitempty"`
			EditedFields map[string]interface{} `json:"edited_fields,omitempty"`
		} `json:"doctor_review,omitempty"`
	}

	// Fetch doctor info if report has been reviewed
	doctorCollection := config.GetCollection("doctors")

	var formattedReports []ReportResponse
	for _, report := range reports {
		confidence := report.AIAnalysis.ConfidenceScore

		response := ReportResponse{
			ID:         report.ID.Hex(),
			Name:       report.PDFFileName,
			Date:       report.UploadedAt.Format("2006-01-02"),
			Status:     report.Status,
			Confidence: &confidence,
			Analysis:   &report.AIAnalysis,
		}

		// If report has doctor review, fetch doctor info
		if report.DoctorReview != nil {
			var doctor models.Doctor
			err := doctorCollection.FindOne(ctx, bson.M{"_id": report.DoctorReview.ReviewedBy}).Decode(&doctor)

			response.DoctorReview = &struct {
				ReviewedBy   string                 `json:"reviewed_by"`
				ReviewedAt   time.Time              `json:"reviewed_at"`
				Notes        string                 `json:"notes"`
				DoctorInfo   *DoctorInfo            `json:"doctor_info,omitempty"`
				EditedFields map[string]interface{} `json:"edited_fields,omitempty"`
			}{
				ReviewedBy:   report.DoctorReview.ReviewedBy.Hex(),
				ReviewedAt:   report.DoctorReview.ReviewedAt,
				Notes:        report.DoctorReview.Notes,
				EditedFields: report.DoctorReview.EditedFields,
			}

			// Add doctor info if found
			if err == nil {
				response.DoctorReview.DoctorInfo = &DoctorInfo{
					Name:           doctor.Name,
					Specialization: doctor.Specialization,
				}
			}
		}

		formattedReports = append(formattedReports, response)
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"count":   len(formattedReports),
		"reports": formattedReports,
	})
}
