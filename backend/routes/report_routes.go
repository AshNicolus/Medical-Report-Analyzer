package routes

import (
	"github.com/Aashishvatwani/Medical-Report-Analyzer/controllers"
	"github.com/gin-gonic/gin"
)

// ReportRoutes registers patient-facing report routes
func ReportRoutes(router *gin.Engine) {
	reportCtrl := controllers.NewReportController()

	report := router.Group("/api/patient")
	{
		report.POST("/upload", reportCtrl.UploadReport)
		report.POST("/reports", reportCtrl.ListReports)
		report.GET("/reports/:id", reportCtrl.GetReport)
		report.GET("/reports/:id/download", reportCtrl.DownloadReport)
	}
}
