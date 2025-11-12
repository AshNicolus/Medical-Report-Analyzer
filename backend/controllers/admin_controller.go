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

type AdminController struct{}

func NewAdminController() *AdminController {
	return &AdminController{}
}

// AdminLogin authenticates an admin
// POST /api/admin/login
func (ctrl *AdminController) AdminLogin(c *gin.Context) {
	var req struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	collection := config.GetCollection("admins")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var admin models.Admin
	err := collection.FindOne(ctx, bson.M{"email": req.Email}).Decode(&admin)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	// Check password
	if !checkPasswordHash(req.Password, admin.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Login successful",
		"user": gin.H{
			"id":    admin.ID.Hex(),
			"name":  admin.Name,
			"email": admin.Email,
			"role":  admin.Role,
			"type":  "admin",
		},
	})
}

// GetAllPatients retrieves all patients
// GET /api/admin/patients
func (ctrl *AdminController) GetAllPatients(c *gin.Context) {
	collection := config.GetCollection("patients")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch patients"})
		return
	}
	defer cursor.Close(ctx)

	var patients []models.Patient
	if err = cursor.All(ctx, &patients); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode patients"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":  true,
		"patients": patients,
		"count":    len(patients),
	})
}

// GetAllDoctors retrieves all doctors
// GET /api/admin/doctors
func (ctrl *AdminController) GetAllDoctors(c *gin.Context) {
	collection := config.GetCollection("doctors")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch doctors"})
		return
	}
	defer cursor.Close(ctx)

	var doctors []models.Doctor
	if err = cursor.All(ctx, &doctors); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode doctors"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"doctors": doctors,
		"count":   len(doctors),
	})
}

// GetAllReports retrieves all reports
// GET /api/admin/reports
func (ctrl *AdminController) GetAllReports(c *gin.Context) {
	collection := config.GetCollection("reports")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch reports"})
		return
	}
	defer cursor.Close(ctx)

	var reports []models.Report
	if err = cursor.All(ctx, &reports); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode reports"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"reports": reports,
		"count":   len(reports),
	})
}

// GetStats retrieves system statistics
// GET /api/admin/stats
func (ctrl *AdminController) GetStats(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Count patients
	patientsCount, err := config.GetCollection("patients").CountDocuments(ctx, bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count patients"})
		return
	}

	// Count doctors
	doctorsCount, err := config.GetCollection("doctors").CountDocuments(ctx, bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count doctors"})
		return
	}

	// Count reports
	reportsCount, err := config.GetCollection("reports").CountDocuments(ctx, bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count reports"})
		return
	}

	// Count reviewed reports
	reviewedCount, err := config.GetCollection("reports").CountDocuments(ctx, bson.M{"status": "reviewed"})
	if err != nil {
		reviewedCount = 0
	}

	// Count pending reports
	pendingCount, err := config.GetCollection("reports").CountDocuments(ctx, bson.M{"status": "pending"})
	if err != nil {
		pendingCount = 0
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"stats": gin.H{
			"total_patients":   patientsCount,
			"total_doctors":    doctorsCount,
			"total_reports":    reportsCount,
			"reviewed_reports": reviewedCount,
			"pending_reports":  pendingCount,
		},
	})
}

// DeletePatient deletes a patient
// DELETE /api/admin/patient/:id
func (ctrl *AdminController) DeletePatient(c *gin.Context) {
	patientID := c.Param("id")

	objectID, err := primitive.ObjectIDFromHex(patientID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid patient ID"})
		return
	}

	collection := config.GetCollection("patients")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	result, err := collection.DeleteOne(ctx, bson.M{"_id": objectID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete patient"})
		return
	}

	if result.DeletedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Patient not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Patient deleted successfully",
	})
}

// DeleteDoctor deletes a doctor
// DELETE /api/admin/doctor/:id
func (ctrl *AdminController) DeleteDoctor(c *gin.Context) {
	doctorID := c.Param("id")

	objectID, err := primitive.ObjectIDFromHex(doctorID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid doctor ID"})
		return
	}

	collection := config.GetCollection("doctors")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	result, err := collection.DeleteOne(ctx, bson.M{"_id": objectID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete doctor"})
		return
	}

	if result.DeletedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Doctor not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Doctor deleted successfully",
	})
}
