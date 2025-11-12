package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Patient struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name      string             `bson:"name" json:"name" binding:"required"`
	Email     string             `bson:"email" json:"email" binding:"required,email"`
	Password  string             `bson:"password" json:"-"` // Never expose in JSON
	Age       int                `bson:"age" json:"age"`
	Gender    string             `bson:"gender" json:"gender"`
	Phone     string             `bson:"phone" json:"phone"`
	CreatedAt time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt time.Time          `bson:"updated_at" json:"updated_at"`
}

type Doctor struct {
	ID             primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name           string             `bson:"name" json:"name" binding:"required"`
	Email          string             `bson:"email" json:"email" binding:"required,email"`
	Password       string             `bson:"password" json:"-"`
	Specialization string             `bson:"specialization" json:"specialization"`
	LicenseNumber  string             `bson:"license_number" json:"license_number"`
	Hospital       string             `bson:"hospital" json:"hospital"`
	CreatedAt      time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt      time.Time          `bson:"updated_at" json:"updated_at"`
}
