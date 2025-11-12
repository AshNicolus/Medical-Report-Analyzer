package controllers

import (
	"net/http"
	"time"

	"github.com/Aashishvatwani/Medical-Report-Analyzer/models"
	"github.com/Aashishvatwani/Medical-Report-Analyzer/services"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type ChatbotController struct {
	chatService *services.ChatbotService
}

func NewChatbotController() *ChatbotController {
	return &ChatbotController{
		chatService: &services.ChatbotService{},
	}
}

// SendMessage handles incoming chat messages from patients
// POST /api/chatbot/message
func (ctrl *ChatbotController) SendMessage(c *gin.Context) {
	var req models.ChatRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get patient ID from context (set by auth middleware) OR from request body
	var patientObjID primitive.ObjectID

	// Try to get from auth middleware first
	patientID, exists := c.Get("user_id")
	if exists {
		var ok bool
		patientObjID, ok = patientID.(primitive.ObjectID)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID"})
			return
		}
	} else {
		// Fall back to patient_id from request body
		if req.PatientID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "patient_id is required"})
			return
		}

		var err error
		patientObjID, err = primitive.ObjectIDFromHex(req.PatientID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid patient_id"})
			return
		}
	}

	// Convert report ID
	reportObjID, err := primitive.ObjectIDFromHex(req.ReportID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid report ID"})
		return
	}

	// Verify report belongs to this patient
	report, err := services.GetReportByID(req.ReportID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Report not found"})
		return
	}

	if report.PatientID != patientObjID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	// Get or create chat session
	session, err := ctrl.chatService.GetOrCreateSession(patientObjID, reportObjID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create session"})
		return
	}

	// Process the message
	response, err := ctrl.chatService.ProcessMessage(session.ID.Hex(), req.ReportID, req.Message)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process message"})
		return
	}

	c.JSON(http.StatusOK, models.ChatResponse{
		SessionID: session.ID.Hex(),
		Message:   response,
		Timestamp: time.Now(),
	})
}

// GetChatHistory retrieves conversation history for a report
// GET /api/chatbot/history/:report_id?patient_id=xxx
func (ctrl *ChatbotController) GetChatHistory(c *gin.Context) {
	reportID := c.Param("report_id")

	// Get patient ID from context OR from query parameter
	var patientObjID primitive.ObjectID

	patientID, exists := c.Get("user_id")
	if exists {
		var ok bool
		patientObjID, ok = patientID.(primitive.ObjectID)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID"})
			return
		}
	} else {
		// Fall back to query parameter
		patientIDStr := c.Query("patient_id")
		if patientIDStr == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "patient_id is required"})
			return
		}

		var err error
		patientObjID, err = primitive.ObjectIDFromHex(patientIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid patient_id"})
			return
		}
	}

	reportObjID, err := primitive.ObjectIDFromHex(reportID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid report ID"})
		return
	}

	// Get session
	session, err := ctrl.chatService.GetOrCreateSession(patientObjID, reportObjID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve session"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"session_id": session.ID.Hex(),
		"messages":   session.Messages,
	})
}
