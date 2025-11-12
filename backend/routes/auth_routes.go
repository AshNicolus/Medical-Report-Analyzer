package routes

import (
	"github.com/Aashishvatwani/Medical-Report-Analyzer/controllers"
	"github.com/gin-gonic/gin"
)

func AuthRoutes(r *gin.Engine) {
	ctrl := controllers.NewAuthController()

	auth := r.Group("/api/auth")
	{
		// Patient authentication
		auth.POST("/patient/signup", ctrl.PatientSignup)
		auth.POST("/patient/login", ctrl.PatientLogin)

		// Doctor authentication
		auth.POST("/doctor/signup", ctrl.DoctorSignup)
		auth.POST("/doctor/login", ctrl.DoctorLogin)

		// Logout (works for both)
		auth.POST("/logout", ctrl.Logout)

		// Profile management
		auth.GET("/profile/:user_id", ctrl.GetProfile)
		auth.POST("/update-profile", ctrl.UpdateProfile)
		auth.POST("/change-password", ctrl.ChangePassword)
	}
}
