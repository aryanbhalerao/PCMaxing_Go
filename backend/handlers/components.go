package handlers

import (
	"log"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"

	"pcmaxing/backend/supabase"
)

// Component mirrors the Supabase `components` table row.
type Component struct {
	ID       int                    `json:"id"`
	Category string                 `json:"category"`
	Name     string                 `json:"name"`
	Price    int                    `json:"price"`
	Details  map[string]interface{} `json:"details"`
}

// ComponentsRouter returns a chi router for /api/components.
func ComponentsRouter() http.Handler {
	r := chi.NewRouter()
	r.Get("/", listComponents)
	r.Get("/{id}", getComponent)
	return r
}

// GET /api/components
// Query params: category, search, sort (price_asc | price_desc)
func listComponents(w http.ResponseWriter, r *http.Request) {
	category := r.URL.Query().Get("category")
	search := r.URL.Query().Get("search")
	sort := r.URL.Query().Get("sort")

	if len(category) > maxParamLen || len(search) > maxParamLen {
		writeError(w, http.StatusBadRequest, "Query parameter too long")
		return
	}

	q := supabase.From("components")

	if category != "" {
		q = q.Eq("category", category)
	}
	if search != "" {
		q = q.ILike("name", "*"+search+"*")
	}

	switch sort {
	case "price_desc":
		q = q.Order("price", false)
	case "price_asc":
		q = q.Order("price", true)
	default:
		q = q.Order("category", true).Order("price", true)
	}

	var components []Component
	if err := q.Execute(r.Context(), &components); err != nil {
		log.Printf("listComponents error: %v", err)
		writeError(w, http.StatusInternalServerError, "Failed to fetch components")
		return
	}

	// Return [] instead of null for empty results.
	if components == nil {
		components = []Component{}
	}
	writeJSON(w, http.StatusOK, components)
}

// GET /api/components/:id
func getComponent(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.Atoi(idStr)
	if err != nil || id <= 0 {
		writeError(w, http.StatusBadRequest, "Invalid component id")
		return
	}

	q := supabase.From("components").Eq("id", strconv.Itoa(id))
	var components []Component
	if err := q.Execute(r.Context(), &components); err != nil {
		log.Printf("getComponent error: %v", err)
		writeError(w, http.StatusInternalServerError, "Failed to fetch component")
		return
	}

	if len(components) == 0 {
		writeError(w, http.StatusNotFound, "Component not found")
		return
	}
	writeJSON(w, http.StatusOK, components[0])
}
