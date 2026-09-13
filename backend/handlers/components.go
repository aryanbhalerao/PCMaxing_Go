package handlers

import (
	"log"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"gorm.io/datatypes"
	"gorm.io/gorm"

	"pcmaxing/backend/db"
)

// Component mirrors the `components` table row.
type Component struct {
	ID       int               `json:"id" gorm:"primaryKey"`
	Category string            `json:"category"`
	Name     string            `json:"name"`
	Price    int               `json:"price"`
	Details  datatypes.JSONMap `json:"details"`
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

	var components []Component
	query := db.DB.Model(&Component{})

	if category != "" {
		query = query.Where("category = ?", category)
	}
	if search != "" {
		query = query.Where("name LIKE ?", "%"+search+"%")
	}

	switch sort {
	case "price_desc":
		query = query.Order("price DESC")
	case "price_asc":
		query = query.Order("price ASC")
	default:
		query = query.Order("category ASC, price ASC")
	}

	if err := query.Find(&components).Error; err != nil {
		log.Printf("listComponents error: %v", err)
		writeError(w, http.StatusInternalServerError, "Failed to fetch components")
		return
	}

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

	var c Component
	if err := db.DB.First(&c, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			writeError(w, http.StatusNotFound, "Component not found")
			return
		}
		log.Printf("getComponent error: %v", err)
		writeError(w, http.StatusInternalServerError, "Failed to fetch component")
		return
	}

	writeJSON(w, http.StatusOK, c)
}
