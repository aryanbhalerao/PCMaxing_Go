package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"

	"pcmaxing/backend/router"
)

// @title PCMaxing API
// @version 1.0
// @description API Server for PCMaxing Application
// @host localhost:5000
// @BasePath /api

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, reading from environment")
	}

	h := router.New()

	port := os.Getenv("PORT")
	if port == "" {
		port = "5000"
	}

	addr := fmt.Sprintf(":%s", port)
	log.Printf("PCMaxing API running on port %s", port)
	log.Fatal(http.ListenAndServe(addr, h))
}
