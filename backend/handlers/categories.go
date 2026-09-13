package handlers

import (
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"

	"pcmaxing/backend/db"
)

// CategoriesRouter returns a chi router for /api/categories.
func CategoriesRouter() http.Handler {
	r := chi.NewRouter()
	r.Get("/", listCategories)
	r.Get("/{category}/components", getCategoryComponents)
	return r
}

// GET /api/categories
func listCategories(w http.ResponseWriter, r *http.Request) {
	categories := []string{}
	if err := db.DB.Model(&Component{}).Distinct("category").Pluck("category", &categories).Error; err != nil {
		log.Printf("listCategories error: %v", err)
		writeError(w, http.StatusInternalServerError, "Failed to fetch categories")
		return
	}
	writeJSON(w, http.StatusOK, categories)
}

// GET /api/categories/:category/components
func getCategoryComponents(w http.ResponseWriter, r *http.Request) {
	category := chi.URLParam(r, "category")
	if category == "" || len(category) > maxParamLen {
		writeError(w, http.StatusBadRequest, "Invalid category")
		return
	}

	components := []Component{}
	if err := db.DB.Where("category = ?", category).Order("price ASC").Find(&components).Error; err != nil {
		log.Printf("getCategoryComponents error: %v", err)
		writeError(w, http.StatusInternalServerError, "Failed to fetch components")
		return
	}

	writeJSON(w, http.StatusOK, components)
}
