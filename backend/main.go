package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"github.com/Aashishvatwani/Medical-Report-Analyzer/config"
	"github.com/Aashishvatwani/Medical-Report-Analyzer/routes"
)

func main() {
	// Load environment variables
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	// Connect to MongoDB
	config.ConnectDB()

	// Setup Gin router
	r := gin.Default()

	// Enable CORS for frontend
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080" // Default port
	}

	// Health check endpoint
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"message": "Medical Report Analyzer Backend is running",
			"port":    port,
		})
	})

	// Test endpoint (no auth required)
	r.POST("/api/chatbot/test", func(c *gin.Context) {
		var req struct {
			Message string `json:"message"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(400, gin.H{"error": "Invalid request"})
			return
		}
		c.JSON(200, gin.H{
			"status":   "success",
			"message":  "Chatbot is working! You said: " + req.Message,
			"response": "This is a test response. The chatbot system is operational.",
		})
	})

	// Serve static files
	r.Static("/public", "./public")
	r.StaticFile("/", "./public/index.html")
	r.StaticFile("/login.html", "./public/login.html")
	r.StaticFile("/chatbot.html", "./public/chatbot.html")
	r.StaticFile("/patient.html", "./public/patient.html")
	r.StaticFile("/doctor.html", "./public/doctor.html")

	// Register all routes
	routes.AuthRoutes(r)    // Authentication for patients and doctors
	routes.ChatbotRoutes(r) // Medical report chatbot
	routes.ReportRoutes(r)  // Patient upload & report retrieval
	routes.DoctorRoutes(r)  // Doctor portal for reviewing reports
	routes.PatientRoutes(r) // Patient portal for viewing reports
	routes.AdminRoutes(r)   // Admin portal for system management

	log.Println("✅ Server running on port:", port)
	log.Println("📊 Health check: http://localhost:" + port + "/health")
	log.Println("� Login Page: http://localhost:" + port + "/login.html")
	log.Println("�📄 Patient Portal: http://localhost:" + port + "/patient.html")
	log.Println("👨‍⚕️ Doctor Portal: http://localhost:" + port + "/doctor.html")
	log.Println("� Chatbot UI: http://localhost:" + port + "/chatbot.html")
	r.Run(":" + port)
}
