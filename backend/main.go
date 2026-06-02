package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/joho/godotenv"
	"github.com/rs/cors"

	"pcmaxing/backend/handlers"
	"pcmaxing/backend/supabase"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, reading from environment")
	}

	supabase.Init()

	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Route("/api", func(r chi.Router) {
		r.Mount("/components", handlers.ComponentsRouter())
		r.Mount("/categories", handlers.CategoriesRouter())
		r.Mount("/compatibility", handlers.CompatibilityRouter())
	})

	allowedOrigin := os.Getenv("ALLOWED_ORIGIN")
	if allowedOrigin == "" {
		allowedOrigin = "http://localhost:5173"
	}

	c := cors.New(cors.Options{
		AllowedOrigins: []string{allowedOrigin},
		AllowedMethods: []string{http.MethodGet, http.MethodPost, http.MethodOptions},
		AllowedHeaders: []string{"Content-Type"},
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "5000"
	}

	addr := fmt.Sprintf(":%s", port)
	log.Printf("PCMaxing API running on port %s", port)
	log.Fatal(http.ListenAndServe(addr, c.Handler(r)))
}
