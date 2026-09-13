// Package router builds the shared HTTP handler used by the local dev
// server (backend/main.go) and the production server.
package router

import (
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/rs/cors"

	"pcmaxing/backend/db"
	"pcmaxing/backend/handlers"
)

// New initializes the database, mounts the API routes, and wraps the
// router with CORS. Environment variables must already be loaded by the caller.
func New() http.Handler {
	db.Init()

	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Route("/api", func(r chi.Router) {
		r.Use(handlers.OptionalAuth)
		r.Get("/docs", func(w http.ResponseWriter, r *http.Request) {
			http.ServeFile(w, r, "backend/swagger.html")
		})
		r.Get("/docs/swagger.yaml", func(w http.ResponseWriter, r *http.Request) {
			http.ServeFile(w, r, "backend/swagger.yaml")
		})


		r.Mount("/components", handlers.ComponentsRouter())
		r.Mount("/categories", handlers.CategoriesRouter())
		r.Mount("/compatibility", handlers.CompatibilityRouter())
		r.Mount("/auth", handlers.AuthRouter())
		r.Mount("/builds", handlers.BuildsRouter())
		r.Mount("/favourites", handlers.FavouritesRouter())
	})

	// In production the SPA and API are served from the same origin, so
	// CORS is not exercised. Set ALLOWED_ORIGIN only to permit cross-origin API
	// access; the default covers local Vite development.
	allowedOrigin := os.Getenv("ALLOWED_ORIGIN")
	if allowedOrigin == "" {
		allowedOrigin = "http://localhost:5173"
	}

	c := cors.New(cors.Options{
		AllowedOrigins: []string{allowedOrigin},
		AllowedMethods: []string{http.MethodGet, http.MethodPost, http.MethodPatch, http.MethodDelete, http.MethodOptions},
		AllowedHeaders: []string{"Content-Type", "Authorization"},
	})

	return c.Handler(r)
}
