package handler

import (
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/rs/cors"

	"pcmaxing/backend/handlers"
	"pcmaxing/backend/supabase"
)

var h http.Handler

func init() {
	supabase.Init()

	r := chi.NewRouter()
	r.Use(middleware.Recoverer)

	r.Route("/api", func(r chi.Router) {
		r.Mount("/components", handlers.ComponentsRouter())
		r.Mount("/categories", handlers.CategoriesRouter())
		r.Mount("/compatibility", handlers.CompatibilityRouter())
	})

	origin := os.Getenv("ALLOWED_ORIGIN")
	if origin == "" {
		origin = "*"
	}
	c := cors.New(cors.Options{
		AllowedOrigins: []string{origin},
		AllowedMethods: []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders: []string{"Content-Type"},
	})
	h = c.Handler(r)
}

// Handler is the Vercel serverless function entry point.
func Handler(w http.ResponseWriter, r *http.Request) {
	h.ServeHTTP(w, r)
}
