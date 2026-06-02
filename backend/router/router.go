// Package router builds the shared HTTP handler used by both the local dev
// server (backend/main.go) and the Vercel serverless entry point (api/index.go).
package router

import (
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/rs/cors"

	"pcmaxing/backend/handlers"
	"pcmaxing/backend/supabase"
)

// New initializes the Supabase client, mounts the API routes, and wraps the
// router with CORS. Environment variables must already be loaded by the caller.
func New() http.Handler {
	supabase.Init()

	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Route("/api", func(r chi.Router) {
		r.Mount("/components", handlers.ComponentsRouter())
		r.Mount("/categories", handlers.CategoriesRouter())
		r.Mount("/compatibility", handlers.CompatibilityRouter())
	})

	// In production the SPA and API are served from the same Vercel origin, so
	// CORS is not exercised. Set ALLOWED_ORIGIN only to permit cross-origin API
	// access; the default covers local Vite development.
	allowedOrigin := os.Getenv("ALLOWED_ORIGIN")
	if allowedOrigin == "" {
		allowedOrigin = "http://localhost:5173"
	}

	c := cors.New(cors.Options{
		AllowedOrigins: []string{allowedOrigin},
		AllowedMethods: []string{http.MethodGet, http.MethodPost, http.MethodOptions},
		AllowedHeaders: []string{"Content-Type"},
	})

	return c.Handler(r)
}
