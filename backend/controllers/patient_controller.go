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

// ReportController handles patient report uploads and retrieval
type Patient struct{}

// GetReport returns structured analysis for a report
// GET /api/patient/reports/:id
func (ctrl *Patient) GetReport(c *gin.Context) {
	PatientID := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(PatientID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid report id"})
		return
	}

	collection := config.GetCollection("patients")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var patient models.Patient
	err = collection.FindOne(ctx, bson.M{"_id": objID}).Decode(&patient)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "patient not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"report_id": patient.ID.Hex(),
		"name":      patient.Name,
		"email":     patient.Email,
		"age":       patient.Age,
		"gender":    patient.Gender,
		"phone":     patient.Phone,
	})
}

// DownloadReport serves the PDF file for download
// GET /api/patient/reports/:id/download

// ListReports returns all reports for a patient
// POST /api/patient/reports
// Body: { "patient_id": "xxx" }
