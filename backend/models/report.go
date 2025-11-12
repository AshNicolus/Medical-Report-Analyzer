package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type AIAnalysis struct {
	Entities struct {
		Symptoms         []string `bson:"symptoms,omitempty" json:"symptoms,omitempty"`
		Diagnoses        []string `bson:"diagnoses,omitempty" json:"diagnoses,omitempty"`
		Medications      []string `bson:"medications,omitempty" json:"medications,omitempty"`
		Tests            []string `bson:"tests,omitempty" json:"tests,omitempty"`
		Vitals           []string `bson:"vitals,omitempty" json:"vitals,omitempty"`
		Severity         []string `bson:"severity,omitempty" json:"severity,omitempty"`
		Urgency          []string `bson:"urgency,omitempty" json:"urgency,omitempty"`
		FunctionalImpact []string `bson:"functional_impact,omitempty" json:"functional_impact,omitempty"`
	} `bson:"entities" json:"entities"`
	Recommendations []struct {
		Test              string   `bson:"test" json:"test"`
		Reason            string   `bson:"reason" json:"reason"`
		Contraindications []string `bson:"contraindications" json:"contraindications"`
		Confidence        float64  `bson:"confidence" json:"confidence"`
		Urgency           string   `bson:"urgency" json:"urgency"`
		Explanation       string   `bson:"explanation,omitempty" json:"explanation,omitempty"`
	} `bson:"recommendations" json:"recommendations"`
	Warnings        []string `bson:"warnings,omitempty" json:"warnings,omitempty"`
	ConfidenceScore float64  `bson:"confidence_score" json:"confidence_score"` // Overall 0-100
}

type DoctorReview struct {
	ReviewedBy   primitive.ObjectID     `bson:"reviewed_by" json:"reviewed_by"`
	ReviewedAt   time.Time              `bson:"reviewed_at" json:"reviewed_at"`
	EditedFields map[string]interface{} `bson:"edited_fields,omitempty" json:"edited_fields,omitempty"`
	Notes        string                 `bson:"notes,omitempty" json:"notes,omitempty"`
}

type Report struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	PatientID    primitive.ObjectID `bson:"patient_id" json:"patient_id"`
	PDFPath      string             `bson:"pdf_path" json:"pdf_path"`
	PDFFileName  string             `bson:"pdf_filename" json:"pdf_filename"`
	UploadedAt   time.Time          `bson:"uploaded_at" json:"uploaded_at"`
	AIAnalysis   AIAnalysis         `bson:"ai_analysis" json:"ai_analysis"`
	DoctorReview *DoctorReview      `bson:"doctor_review,omitempty" json:"doctor_review,omitempty"`
	Status       string             `bson:"status" json:"status"` // "pending", "reviewed", "edited"
	UpdatedAt    time.Time          `bson:"updated_at" json:"updated_at"`
}

type Feedback struct {
	ID                primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	ReportID          primitive.ObjectID `bson:"report_id" json:"report_id"`
	DoctorID          primitive.ObjectID `bson:"doctor_id" json:"doctor_id"`
	OriginalAnalysis  interface{}        `bson:"original_analysis" json:"original_analysis"`
	CorrectedAnalysis interface{}        `bson:"corrected_analysis" json:"corrected_analysis"`
	AccuracyScore     float64            `bson:"accuracy_score" json:"accuracy_score"`
	Comments          string             `bson:"comments" json:"comments"`
	CreatedAt         time.Time          `bson:"created_at" json:"created_at"`
}
