package routes

import (
	"github.com/Aashishvatwani/Medical-Report-Analyzer/controllers"
	"github.com/gin-gonic/gin"
)

func DoctorRoutes(r *gin.Engine) {
	ctrl := controllers.NewDoctorController()

	doctor := r.Group("/api/doctor")
	{
		// Report management
		doctor.GET("/reports", ctrl.GetAllReports)            // List all reports (with optional status filter)
		doctor.GET("/reports/:id", ctrl.GetReportByID)        // Get specific report details
		doctor.POST("/reports/:id/review", ctrl.SubmitReview) // Submit review for a report
		doctor.PUT("/reports/:id/edit", ctrl.EditAnalysis)    // Edit AI analysis (only if confidence < 90%)

		// Patient management
		doctor.GET("/patients", ctrl.GetPatients)
		// List all patients
		doctor.GET("/patients/:patient_id/reports", ctrl.GetPatientReports) // Get all reports for a patient
	}
}
