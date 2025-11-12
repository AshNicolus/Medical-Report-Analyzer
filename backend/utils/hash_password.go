package main

import (
	"fmt"
	"os"

	"golang.org/x/crypto/bcrypt"
)

func main() {
	if len(os.Args) < 2 {
		fmt.Println("Usage: go run hash_password.go <password>")
		fmt.Println("Example: go run hash_password.go admin123")
		os.Exit(1)
	}

	password := os.Args[1]

	// Generate bcrypt hash
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	if err != nil {
		fmt.Println("Error generating hash:", err)
		os.Exit(1)
	}

	fmt.Println("=====================================")
	fmt.Println("Password:", password)
	fmt.Println("=====================================")
	fmt.Println("Bcrypt Hash:")
	fmt.Println(string(hashedPassword))
	fmt.Println("=====================================")
	fmt.Println("\nMongoDB Insert Command:")
	fmt.Println("db.admins.insertOne({")
	fmt.Println("  name: \"Admin User\",")
	fmt.Println("  email: \"admin@example.com\",")
	fmt.Printf("  password: \"%s\",\n", string(hashedPassword))
	fmt.Println("  role: \"super_admin\",")
	fmt.Println("  created_at: new Date(),")
	fmt.Println("  updated_at: new Date()")
	fmt.Println("})")
	fmt.Println("=====================================")
}
