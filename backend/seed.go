package main

import (
	"fmt"
	"golang.org/x/crypto/bcrypt"
	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
	"time"
)

type User struct {
	ID           string    `gorm:"primaryKey"`
	Email        string
	Username     string
	PasswordHash string
	CreatedAt    time.Time
}

type PopularBuild struct {
	ID          uint `gorm:"primaryKey"`
	Name        string
	Description string
	Parts       string
	TotalPrice  int
	Tier        string
	CreatedAt   time.Time
}

func main() {
	db, err := gorm.Open(sqlite.Open("../pcmaxing.db"), &gorm.Config{})
	if err != nil {
		panic(err)
	}

	// Drop users and related data
	db.Exec("DELETE FROM users")
	db.Exec("DELETE FROM sessions")
	db.Exec("DELETE FROM saved_builds")
	db.Exec("DELETE FROM build_history")
	db.Exec("DELETE FROM favourite_components")
	db.Exec("DELETE FROM popular_builds")

	hash, _ := bcrypt.GenerateFromPassword([]byte("Password!1"), bcrypt.DefaultCost)
	passHash := string(hash)

	users := []User{
		{ID: "u1", Email: "test1@test.com", Username: "test1", PasswordHash: passHash, CreatedAt: time.Now()},
		{ID: "u2", Email: "test2@test.com", Username: "test2", PasswordHash: passHash, CreatedAt: time.Now()},
		{ID: "u3", Email: "test3@test.com", Username: "test3", PasswordHash: passHash, CreatedAt: time.Now()},
	}

	for _, u := range users {
		db.Create(&u)
	}

	builds := []PopularBuild{
		{Name: "test1s_rig1", Description: "Budget rig", Parts: `[{"category":"CPU","name":"Intel Core i3-12100F","price":9500}]`, TotalPrice: 9500, Tier: "Budget", CreatedAt: time.Now()},
		{Name: "test2s_beast", Description: "Mid-range", Parts: `[{"category":"CPU","name":"AMD Ryzen 5 5600","price":14000}]`, TotalPrice: 14000, Tier: "Mid", CreatedAt: time.Now()},
		{Name: "test3s_dream", Description: "High-end", Parts: `[{"category":"CPU","name":"Intel Core i5-13600K","price":27000}]`, TotalPrice: 27000, Tier: "High", CreatedAt: time.Now()},
		{Name: "test1s_office", Description: "Office build", Parts: `[{"category":"CPU","name":"Intel Core i3-12100F","price":9500}]`, TotalPrice: 9500, Tier: "Budget", CreatedAt: time.Now()},
		{Name: "test2s_gaming", Description: "Gaming build", Parts: `[{"category":"CPU","name":"AMD Ryzen 7 5800X","price":26000}]`, TotalPrice: 26000, Tier: "High", CreatedAt: time.Now()},
		{Name: "test3s_workstation", Description: "Workstation build", Parts: `[{"category":"CPU","name":"AMD Ryzen 9 7950X","price":67000}]`, TotalPrice: 67000, Tier: "Enthusiast", CreatedAt: time.Now()},
		{Name: "test1s_htpc", Description: "HTPC build", Parts: `[{"category":"CPU","name":"AMD Ryzen 3 3100","price":7500}]`, TotalPrice: 7500, Tier: "Budget", CreatedAt: time.Now()},
	}

	for _, b := range builds {
		db.Create(&b)
	}

	fmt.Println("Seeded successfully!")
}
