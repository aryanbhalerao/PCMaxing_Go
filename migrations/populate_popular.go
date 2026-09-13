package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
	"time"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

type Component struct {
	ID       int             `json:"id"`
	Category string          `json:"category"`
	Name     string          `json:"name"`
	Price    float64         `json:"price"`
	Details  json.RawMessage `json:"details"`
}

type PopularBuild struct {
	ID          int
	Name        string
	Description string
	Parts       string
	TotalPrice  int
	Tier        string
}

func main() {
	fmt.Println("Starting backend server...")
	cmd := exec.Command("go", "run", "backend/main.go")
	cmd.Dir = "C:\\Users\\aryan\\repos\\PCMaxing_Go"
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	if err := cmd.Start(); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
	defer func() {
		fmt.Println("Stopping server...")
		cmd.Process.Kill()
	}()

	time.Sleep(3 * time.Second)

	users := []string{}
	for i := 1; i <= 4; i++ {
		username := fmt.Sprintf("test%d", i)
		email := fmt.Sprintf("test%d@pcmaxing.xyz", i)
		
		reqBody, _ := json.Marshal(map[string]string{
			"email":    email,
			"username": username,
			"password": "password123",
		})
		
		resp, err := http.Post("http://localhost:5000/api/auth/signup", "application/json", bytes.NewBuffer(reqBody))
		if err != nil {
			log.Printf("Failed to request signup for %s: %v\n", username, err)
		} else {
			if resp.StatusCode == 200 {
				fmt.Printf("Success creating %s\n", username)
			} else {
				fmt.Printf("Failed or already exists %s: status %d\n", username, resp.StatusCode)
			}
			resp.Body.Close()
		}
		users = append(users, username)
	}

	dbPath := "C:\\Users\\aryan\\repos\\PCMaxing_Go\\pcmaxing.db"
	db, err := gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect database: %v", err)
	}

	db.Exec("DELETE FROM popular_builds")

	var parts []Component
	resp, err := http.Get("http://localhost:5000/api/components")
	if err == nil && resp.StatusCode == 200 {
		var comps []Component
		if err := json.NewDecoder(resp.Body).Decode(&comps); err == nil {
			var cpu, gpu *Component
			for i, c := range comps {
				if c.Category == "CPU" && cpu == nil {
					cpu = &comps[i]
				}
				if c.Category == "GPU" && gpu == nil {
					gpu = &comps[i]
				}
			}
			if cpu != nil {
				parts = append(parts, *cpu)
			}
			if gpu != nil {
				parts = append(parts, *gpu)
			}
		}
		resp.Body.Close()
	}

	partsJSON, _ := json.Marshal(parts)
	if string(partsJSON) == "null" {
		partsJSON = []byte("[]")
	}

	tiers := []string{"Budget", "Mid", "High", "Enthusiast"}

	for i := 1; i <= 10; i++ {
		user := users[i%4]
		name := fmt.Sprintf("Build #%d by %s", i, user)
		tier := tiers[i%4]
		price := 50000 + i*10000

		build := PopularBuild{
			Name:        name,
			Description: fmt.Sprintf("A great %s PC build created by our user %s.", tier, user),
			Parts:       string(partsJSON),
			TotalPrice:  price,
			Tier:        tier,
		}

		if err := db.Create(&build).Error; err != nil {
			log.Printf("Failed to insert build %d: %v\n", i, err)
		}
	}

	fmt.Println("Successfully populated 10 popular builds.")
}
