package handlers

import (
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"

	"pcmaxing/backend/supabase"
)

type categoryRow struct {
	Category string `json:"category"`
}

// CategoriesRouter returns a chi router for /api/categories.
func CategoriesRouter() http.Handler {
	r := chi.NewRouter()
	r.Get("/", listCategories)
	r.Get("/{category}/components", getCategoryComponents)
	return r
}

// GET /api/categories
func listCategories(w http.ResponseWriter, r *http.Request) {
	q := supabase.From("components").Select("category").Order("category", true)
	var rows []categoryRow
	if err := q.Execute(&rows); err != nil {
		log.Printf("listCategories error: %v", err)
		writeError(w, http.StatusInternalServerError, "Failed to fetch categories")
		return
	}

	seen := make(map[string]bool)
	categories := make([]string, 0)
	for _, row := range rows {
		if !seen[row.Category] {
			seen[row.Category] = true
			categories = append(categories, row.Category)
		}
	}
	writeJSON(w, http.StatusOK, categories)
}

// GET /api/categories/:category/components
func getCategoryComponents(w http.ResponseWriter, r *http.Request) {
	category := chi.URLParam(r, "category")
	q := supabase.From("components").Eq("category", category).Order("price", true)
	var components []Component
	if err := q.Execute(&components); err != nil {
		log.Printf("getCategoryComponents error: %v", err)
		writeError(w, http.StatusInternalServerError, "Failed to fetch components")
		return
	}

	if components == nil {
		components = []Component{}
	}
	writeJSON(w, http.StatusOK, components)
}
