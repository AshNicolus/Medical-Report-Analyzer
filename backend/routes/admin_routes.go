package routes

import (
	"github.com/Aashishvatwani/Medical-Report-Analyzer/controllers"
	"github.com/gin-gonic/gin"
)

func AdminRoutes(r *gin.Engine) {
	ctrl := controllers.NewAdminController()

	admin := r.Group("/api/admin")
	{
		// Authentication
		admin.POST("/login", ctrl.AdminLogin)

		// Statistics
		admin.GET("/stats", ctrl.GetStats)

		// User Management
		admin.GET("/patients", ctrl.GetAllPatients)
		admin.GET("/doctors", ctrl.GetAllDoctors)
		admin.DELETE("/patient/:id", ctrl.DeletePatient)
		admin.DELETE("/doctor/:id", ctrl.DeleteDoctor)

		// Report Management
		admin.GET("/reports", ctrl.GetAllReports)
	}
}
