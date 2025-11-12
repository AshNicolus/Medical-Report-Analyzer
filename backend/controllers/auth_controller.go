package controllers

import (
	"context"
	"net/http"
	"time"

	"github.com/Aashishvatwani/Medical-Report-Analyzer/config"
	"github.com/Aashishvatwani/Medical-Report-Analyzer/models"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"
)

type AuthController struct{}

func NewAuthController() *AuthController {
	return &AuthController{}
}

// HashPassword hashes a plain text password
func hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

// CheckPasswordHash compares a password with a hash
func checkPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// PatientSignup creates a new patient account
// POST /api/auth/patient/signup
func (ctrl *AuthController) PatientSignup(c *gin.Context) {
	var req struct {
		Name     string `json:"name" binding:"required"`
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required,min=6"`
		Age      int    `json:"age"`
		Gender   string `json:"gender"`
		Phone    string `json:"phone"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	collection := config.GetCollection("patients")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Check if email already exists
	var existingPatient models.Patient
	err := collection.FindOne(ctx, bson.M{"email": req.Email}).Decode(&existingPatient)
	if err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Email already registered"})
		return
	}

	// Hash password
	hashedPassword, err := hashPassword(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// Create patient
	patient := models.Patient{
		ID:        primitive.NewObjectID(),
		Name:      req.Name,
		Email:     req.Email,
		Password:  hashedPassword,
		Age:       req.Age,
		Gender:    req.Gender,
		Phone:     req.Phone,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	_, err = collection.InsertOne(ctx, patient)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create patient account"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Patient account created successfully",
		"patient": gin.H{
			"id":    patient.ID.Hex(),
			"name":  patient.Name,
			"email": patient.Email,
		},
	})
}

// PatientLogin authenticates a patient
// POST /api/auth/patient/login
func (ctrl *AuthController) PatientLogin(c *gin.Context) {
	var req struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	collection := config.GetCollection("patients")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var patient models.Patient
	err := collection.FindOne(ctx, bson.M{"email": req.Email}).Decode(&patient)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	// Check password
	if !checkPasswordHash(req.Password, patient.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	// In production, generate JWT token here
	// For now, return patient info
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Login successful",
		"user": gin.H{
			"id":     patient.ID.Hex(),
			"name":   patient.Name,
			"email":  patient.Email,
			"age":    patient.Age,
			"gender": patient.Gender,
			"phone":  patient.Phone,
			"type":   "patient",
		},
	})
}

// DoctorSignup creates a new doctor account
// POST /api/auth/doctor/signup
func (ctrl *AuthController) DoctorSignup(c *gin.Context) {
	var req struct {
		Name           string `json:"name" binding:"required"`
		Email          string `json:"email" binding:"required,email"`
		Password       string `json:"password" binding:"required,min=6"`
		Specialization string `json:"specialization" binding:"required"`
		LicenseNumber  string `json:"license_number" binding:"required"`
		Hospital       string `json:"hospital"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	collection := config.GetCollection("doctors")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Check if email already exists
	var existingDoctor models.Doctor
	err := collection.FindOne(ctx, bson.M{"email": req.Email}).Decode(&existingDoctor)
	if err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Email already registered"})
		return
	}

	// Check if license number already exists
	err = collection.FindOne(ctx, bson.M{"license_number": req.LicenseNumber}).Decode(&existingDoctor)
	if err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "License number already registered"})
		return
	}

	// Hash password
	hashedPassword, err := hashPassword(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// Create doctor
	doctor := models.Doctor{
		ID:             primitive.NewObjectID(),
		Name:           req.Name,
		Email:          req.Email,
		Password:       hashedPassword,
		Specialization: req.Specialization,
		LicenseNumber:  req.LicenseNumber,
		Hospital:       req.Hospital,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	_, err = collection.InsertOne(ctx, doctor)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create doctor account"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Doctor account created successfully",
		"doctor": gin.H{
			"id":             doctor.ID.Hex(),
			"name":           doctor.Name,
			"email":          doctor.Email,
			"specialization": doctor.Specialization,
		},
	})
}

// DoctorLogin authenticates a doctor
// POST /api/auth/doctor/login
func (ctrl *AuthController) DoctorLogin(c *gin.Context) {
	var req struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	collection := config.GetCollection("doctors")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var doctor models.Doctor
	err := collection.FindOne(ctx, bson.M{"email": req.Email}).Decode(&doctor)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	// Check password
	if !checkPasswordHash(req.Password, doctor.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	// In production, generate JWT token here
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Login successful",
		"user": gin.H{
			"id":             doctor.ID.Hex(),
			"name":           doctor.Name,
			"email":          doctor.Email,
			"specialization": doctor.Specialization,
			"license_number": doctor.LicenseNumber,
			"hospital":       doctor.Hospital,
			"type":           "doctor",
		},
	})
}

// Logout (client-side token removal)
// POST /api/auth/logout
func (ctrl *AuthController) Logout(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Logged out successfully",
	})
}

// GetProfile retrieves patient profile
// GET /api/auth/profile/:user_id
func (ctrl *AuthController) GetProfile(c *gin.Context) {
	userID := c.Param("user_id")

	// Convert user_id to ObjectID
	objectID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	collection := config.GetCollection("patients")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var patient models.Patient
	err = collection.FindOne(ctx, bson.M{"_id": objectID}).Decode(&patient)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"user": gin.H{
			"id":     patient.ID.Hex(),
			"name":   patient.Name,
			"email":  patient.Email,
			"age":    patient.Age,
			"gender": patient.Gender,
			"phone":  patient.Phone,
			"role":   "patient",
		},
	})
}

// UpdateProfile updates patient profile
// POST /api/auth/update-profile
func (ctrl *AuthController) UpdateProfile(c *gin.Context) {
	var req struct {
		UserID string `json:"user_id" binding:"required"`
		Name   string `json:"name" binding:"required"`
		Phone  string `json:"phone"`
		Age    int    `json:"age"`
		Gender string `json:"gender"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Convert user_id to ObjectID
	objectID, err := primitive.ObjectIDFromHex(req.UserID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	collection := config.GetCollection("patients")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Update patient
	update := bson.M{
		"$set": bson.M{
			"name":       req.Name,
			"phone":      req.Phone,
			"age":        req.Age,
			"gender":     req.Gender,
			"updated_at": time.Now(),
		},
	}

	result, err := collection.UpdateOne(ctx, bson.M{"_id": objectID}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile"})
		return
	}

	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Get updated patient data
	var patient models.Patient
	err = collection.FindOne(ctx, bson.M{"_id": objectID}).Decode(&patient)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve updated profile"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Profile updated successfully",
		"user": gin.H{
			"id":     patient.ID.Hex(),
			"name":   patient.Name,
			"email":  patient.Email,
			"age":    patient.Age,
			"gender": patient.Gender,
			"phone":  patient.Phone,
		},
	})
}

// ChangePassword updates user password
// POST /api/auth/change-password
func (ctrl *AuthController) ChangePassword(c *gin.Context) {
	var req struct {
		UserID          string `json:"user_id" binding:"required"`
		CurrentPassword string `json:"current_password" binding:"required"`
		NewPassword     string `json:"new_password" binding:"required,min=6"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Convert user_id to ObjectID
	objectID, err := primitive.ObjectIDFromHex(req.UserID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	collection := config.GetCollection("patients")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Get current patient
	var patient models.Patient
	err = collection.FindOne(ctx, bson.M{"_id": objectID}).Decode(&patient)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Verify current password
	if !checkPasswordHash(req.CurrentPassword, patient.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Current password is incorrect"})
		return
	}

	// Hash new password
	hashedPassword, err := hashPassword(req.NewPassword)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// Update password
	update := bson.M{
		"$set": bson.M{
			"password":   hashedPassword,
			"updated_at": time.Now(),
		},
	}

	_, err = collection.UpdateOne(ctx, bson.M{"_id": objectID}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update password"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Password changed successfully",
	})
}
