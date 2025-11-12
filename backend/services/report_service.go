package services

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"time"

	"github.com/Aashishvatwani/Medical-Report-Analyzer/config"
	"github.com/Aashishvatwani/Medical-Report-Analyzer/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// AnalyzePDFReport sends a PDF to the Python FastAPI and returns structured analysis
func AnalyzePDFReport(pdfPath string) (*models.AIAnalysis, error) {
	// Python API endpoint
	pythonAPIURL := os.Getenv("PYTHON_API_URL")
	if pythonAPIURL == "" {
		pythonAPIURL = "http://localhost:8000" // Default
	}

	// Open the PDF file
	file, err := os.Open(pdfPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open PDF: %w", err)
	}
	defer file.Close()

	// Create multipart form

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	part, err := writer.CreateFormFile("file", pdfPath)
	if err != nil {
		return nil, fmt.Errorf("failed to create form file: %w", err)
	}

	_, err = io.Copy(part, file)
	if err != nil {
		return nil, fmt.Errorf("failed to copy file: %w", err)
	}
	writer.Close()

	// Make POST request to Python API
	req, err := http.NewRequest("POST", pythonAPIURL+"/analyze_report", body)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())

	client := &http.Client{Timeout: 60 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to call Python API: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("Python API error (status %d): %s", resp.StatusCode, string(bodyBytes))
	}

	// Parse response
	var apiResponse struct {
		Entities        map[string][]string `json:"entities"`
		Recommendations []struct {
			Test              string   `json:"test"`
			Reason            string   `json:"reason"`
			Contraindications []string `json:"contraindications"`
			Confidence        float64  `json:"confidence"`
			Urgency           string   `json:"urgency"`
			Explanation       string   `json:"explanation"`
		} `json:"recommendations"`
		Warnings []string `json:"warnings"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&apiResponse); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	// Map to AIAnalysis model
	analysis := &models.AIAnalysis{
		Warnings: apiResponse.Warnings,
	}

	// Map entities
	if val, ok := apiResponse.Entities["symptoms"]; ok {
		analysis.Entities.Symptoms = val
	}
	if val, ok := apiResponse.Entities["diagnoses"]; ok {
		analysis.Entities.Diagnoses = val
	}
	if val, ok := apiResponse.Entities["medications"]; ok {
		analysis.Entities.Medications = val
	}
	if val, ok := apiResponse.Entities["tests"]; ok {
		analysis.Entities.Tests = val
	}
	if val, ok := apiResponse.Entities["vitals"]; ok {
		analysis.Entities.Vitals = val
	}
	if val, ok := apiResponse.Entities["severity"]; ok {
		analysis.Entities.Severity = val
	}
	if val, ok := apiResponse.Entities["urgency"]; ok {
		analysis.Entities.Urgency = val
	}
	if val, ok := apiResponse.Entities["functional_impact"]; ok {
		analysis.Entities.FunctionalImpact = val
	}

	// Map recommendations
	for _, rec := range apiResponse.Recommendations {
		analysis.Recommendations = append(analysis.Recommendations, struct {
			Test              string   `bson:"test" json:"test"`
			Reason            string   `bson:"reason" json:"reason"`
			Contraindications []string `bson:"contraindications" json:"contraindications"`
			Confidence        float64  `bson:"confidence" json:"confidence"`
			Urgency           string   `bson:"urgency" json:"urgency"`
			Explanation       string   `bson:"explanation,omitempty" json:"explanation,omitempty"`
		}{
			Test:              rec.Test,
			Reason:            rec.Reason,
			Contraindications: rec.Contraindications,
			Confidence:        100 * rec.Confidence,
			Urgency:           rec.Urgency,
			Explanation:       rec.Explanation,
		})
	}

	// Calculate overall confidence score (average of recommendations)
	if len(analysis.Recommendations) > 0 {
		var sum float64
		for _, rec := range analysis.Recommendations {
			sum += rec.Confidence
		}
		analysis.ConfidenceScore = (sum / float64(len(analysis.Recommendations))) * 100
	} else {
		analysis.ConfidenceScore = 0.0
	}

	return analysis, nil
}

// GetReportByID retrieves a report from the database
func GetReportByID(reportID string) (*models.Report, error) {
	objID, err := primitive.ObjectIDFromHex(reportID)
	if err != nil {
		return nil, fmt.Errorf("invalid report ID: %w", err)
	}

	collection := config.GetCollection("reports")
	var report models.Report

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	err = collection.FindOne(ctx, bson.M{"_id": objID}).Decode(&report)
	if err != nil {
		return nil, fmt.Errorf("report not found: %w", err)
	}

	return &report, nil
}
