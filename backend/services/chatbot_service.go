package services

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/Aashishvatwani/Medical-Report-Analyzer/config"
	"github.com/Aashishvatwani/Medical-Report-Analyzer/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// ChatbotService handles chatbot interactions
type ChatbotService struct{}

// GetOrCreateSession retrieves or creates a chat session for a report
func (s *ChatbotService) GetOrCreateSession(patientID, reportID primitive.ObjectID) (*models.ChatSession, error) {
	collection := config.GetCollection("chat_sessions")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Try to find existing session
	var session models.ChatSession
	err := collection.FindOne(ctx, bson.M{
		"patient_id": patientID,
		"report_id":  reportID,
	}).Decode(&session)

	if err == nil {
		// Session found
		return &session, nil
	}

	// Create new session
	session = models.ChatSession{
		ID:        primitive.NewObjectID(),
		PatientID: patientID,
		ReportID:  reportID,
		Messages:  []models.ChatMessage{},
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	_, err = collection.InsertOne(ctx, session)
	if err != nil {
		return nil, fmt.Errorf("failed to create session: %w", err)
	}

	return &session, nil
}

// ProcessMessage handles a user message and returns AI response
func (s *ChatbotService) ProcessMessage(sessionID, reportID, userMessage string) (string, error) {
	// Get the report to extract context
	report, err := GetReportByID(reportID)
	if err != nil {
		return "", fmt.Errorf("failed to get report: %w", err)
	}

	// Get the session
	objID, _ := primitive.ObjectIDFromHex(sessionID)
	collection := config.GetCollection("chat_sessions")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var session models.ChatSession
	err = collection.FindOne(ctx, bson.M{"_id": objID}).Decode(&session)
	if err != nil {
		return "", fmt.Errorf("session not found: %w", err)
	}

	// Build context from report analysis
	context := s.buildReportContext(report)

	// Build conversation history
	conversationHistory := s.buildConversationHistory(session.Messages)

	// Call Azure OpenAI/GPT API
	aiResponse, err := s.callAzureGPT(context, conversationHistory, userMessage)
	if err != nil {
		return "", fmt.Errorf("failed to get AI response: %w", err)
	}

	// Update session with new messages
	session.Messages = append(session.Messages,
		models.ChatMessage{
			Role:      "user",
			Content:   userMessage,
			Timestamp: time.Now(),
		},
		models.ChatMessage{
			Role:      "assistant",
			Content:   aiResponse,
			Timestamp: time.Now(),
		},
	)
	session.UpdatedAt = time.Now()

	_, err = collection.UpdateOne(
		ctx,
		bson.M{"_id": objID},
		bson.M{"$set": bson.M{
			"messages":   session.Messages,
			"updated_at": session.UpdatedAt,
		}},
	)

	return aiResponse, err
}

// buildReportContext creates a summary of the report for AI context
func (s *ChatbotService) buildReportContext(report *models.Report) string {
	var builder strings.Builder

	builder.WriteString("Medical Report Summary:\n\n")

	// Entities
	if len(report.AIAnalysis.Entities.Symptoms) > 0 {
		builder.WriteString(fmt.Sprintf("Symptoms: %s\n", strings.Join(report.AIAnalysis.Entities.Symptoms, ", ")))
	}
	if len(report.AIAnalysis.Entities.Diagnoses) > 0 {
		builder.WriteString(fmt.Sprintf("Diagnoses: %s\n", strings.Join(report.AIAnalysis.Entities.Diagnoses, ", ")))
	}
	if len(report.AIAnalysis.Entities.Medications) > 0 {
		builder.WriteString(fmt.Sprintf("Medications: %s\n", strings.Join(report.AIAnalysis.Entities.Medications, ", ")))
	}
	if len(report.AIAnalysis.Entities.Tests) > 0 {
		builder.WriteString(fmt.Sprintf("Tests: %s\n", strings.Join(report.AIAnalysis.Entities.Tests, ", ")))
	}

	// Recommendations
	if len(report.AIAnalysis.Recommendations) > 0 {
		builder.WriteString("\nRecommended Tests:\n")
		for i, rec := range report.AIAnalysis.Recommendations {
			builder.WriteString(fmt.Sprintf("%d. %s - %s (Confidence: %.0f%%, Urgency: %s)\n",
				i+1, rec.Test, rec.Reason, rec.Confidence*100, rec.Urgency))
		}
	}

	builder.WriteString(fmt.Sprintf("\nOverall Confidence Score: %.1f%%\n", report.AIAnalysis.ConfidenceScore))

	return builder.String()
}

// buildConversationHistory formats previous messages for AI
func (s *ChatbotService) buildConversationHistory(messages []models.ChatMessage) []map[string]string {
	var history []map[string]string
	for _, msg := range messages {
		history = append(history, map[string]string{
			"role":    msg.Role,
			"content": msg.Content,
		})
	}
	return history
}

// callAzureGPT makes a request to Azure OpenAI API
func (s *ChatbotService) callAzureGPT(reportContext string, conversationHistory []map[string]string, userMessage string) (string, error) {
	apiKey := os.Getenv("AZURE_OPENAI_KEY")
	endpoint := os.Getenv("AZURE_OPENAI_ENDPOINT")
	deployment := os.Getenv("AZURE_OPENAI_DEPLOYMENT")

	if apiKey == "" || endpoint == "" {
		// Fallback to simple rule-based response if Azure is not configured
		return s.generateSimpleResponse(reportContext, userMessage), nil
	}

	url := fmt.Sprintf("%s/openai/deployments/%s/chat/completions?api-version=2023-05-15", endpoint, deployment)

	// Build messages array
	messages := []map[string]string{
		{
			"role":    "system",
			"content": fmt.Sprintf("You are a helpful medical assistant. Answer patient questions about their medical report. Use only the information from the report context. Be empathetic and clear. Here is the report:\n\n%s", reportContext),
		},
	}
	messages = append(messages, conversationHistory...)
	messages = append(messages, map[string]string{
		"role":    "user",
		"content": userMessage,
	})

	requestBody := map[string]interface{}{
		"messages":    messages,
		"max_tokens":  500,
		"temperature": 0.7,
	}

	jsonData, err := json.Marshal(requestBody)
	if err != nil {
		return "", err
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return "", err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("api-key", apiKey)

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("Azure API error: status %d", resp.StatusCode)
	}

	var response struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return "", err
	}

	if len(response.Choices) == 0 {
		return "", fmt.Errorf("no response from AI")
	}

	return response.Choices[0].Message.Content, nil
}

// generateSimpleResponse provides basic rule-based responses as fallback
func (s *ChatbotService) generateSimpleResponse(reportContext, userMessage string) string {
	msg := strings.ToLower(userMessage)

	if strings.Contains(msg, "symptom") {
		return "Based on your report, the symptoms identified are listed in the summary. If you need specific clarification, please refer to the symptoms section."
	}
	if strings.Contains(msg, "diagnos") {
		return "Your report contains the diagnoses as analyzed. For detailed medical advice, please consult with your doctor."
	}
	if strings.Contains(msg, "medication") || strings.Contains(msg, "medicine") {
		return "The medications mentioned in your report are listed. Always follow your doctor's prescription."
	}
	if strings.Contains(msg, "test") || strings.Contains(msg, "recommend") {
		return "The recommended tests are based on the analysis. Please discuss with your healthcare provider for scheduling."
	}

	return "I can help you understand your medical report. You can ask about symptoms, diagnoses, medications, or recommended tests."
}
