package routes

import (
	"github.com/Aashishvatwani/Medical-Report-Analyzer/controllers"
	"github.com/gin-gonic/gin"
)

// ChatbotRoutes registers all chatbot-related routes
func ChatbotRoutes(router *gin.Engine) {
	chatCtrl := controllers.NewChatbotController()

	chatbot := router.Group("/api/chatbot")
	{
		// Send a message to the chatbot
		chatbot.POST("/message", chatCtrl.SendMessage)

		// Get chat history for a specific report
		chatbot.GET("/history/:report_id", chatCtrl.GetChatHistory)
	}
}
