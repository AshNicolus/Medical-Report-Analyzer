package routes

import (
	"github.com/Aashishvatwani/Medical-Report-Analyzer/controllers"
	"github.com/gin-gonic/gin"
)

func PatientRoutes(r *gin.Engine) {
	ctrl := controllers.NewDoctorController()

	patient := r.Group("/api/patient")
	{
		// Report management
		// Edit AI analysis (only if confidence < 90%)

		// Patient management
		patient.GET("/patients/:id", ctrl.GetPatients)
		// List all patients
		// Get all reports for a patient
	}
}
