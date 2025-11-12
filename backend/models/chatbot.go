package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// ChatMessage represents a single message in the conversation
type ChatMessage struct {
	Role      string    `bson:"role" json:"role"` // "user" or "assistant"
	Content   string    `bson:"content" json:"content"`
	Timestamp time.Time `bson:"timestamp" json:"timestamp"`
}

// ChatSession represents a conversation session about a specific report
type ChatSession struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	PatientID primitive.ObjectID `bson:"patient_id" json:"patient_id"`
	ReportID  primitive.ObjectID `bson:"report_id" json:"report_id"`
	Messages  []ChatMessage      `bson:"messages" json:"messages"`
	CreatedAt time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt time.Time          `bson:"updated_at" json:"updated_at"`
}

// ChatRequest represents the incoming chat request from the user
type ChatRequest struct {
	PatientID string `json:"patient_id"` // Optional if auth middleware is present
	ReportID  string `json:"report_id" binding:"required"`
	Message   string `json:"message" binding:"required"`
}

// ChatResponse represents the chatbot's response
type ChatResponse struct {
	SessionID string    `json:"session_id"`
	Message   string    `json:"message"`
	Timestamp time.Time `json:"timestamp"`
}
