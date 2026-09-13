package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"

	"pcmaxing/backend/db"
)

type Favourite struct {
	UserID      string `json:"user_id"`
	ComponentID string `json:"component_id"`
}

func FavouritesRouter() chi.Router {
	r := chi.NewRouter()
	r.Get("/", getFavourites)
	r.Post("/", addFavourite)
	r.Delete("/{component_id}", removeFavourite)
	return r
}

func getFavourites(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(UserIDKey).(string)
	if !ok {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	rows, err := db.DB.Raw("SELECT component_id FROM favourite_components WHERE user_id = ?", userID).Rows()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to get favourites")
		return
	}
	defer rows.Close()

	var ids []string
	for rows.Next() {
		var compID string
		if err := rows.Scan(&compID); err == nil {
			ids = append(ids, compID)
		}
	}

	if ids == nil {
		ids = []string{}
	}

	writeJSON(w, http.StatusOK, ids)
}

func addFavourite(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(UserIDKey).(string)
	if !ok {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var req struct {
		ComponentID string `json:"component_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request")
		return
	}

	id := uuid.New().String()
	err := db.DB.Exec("INSERT OR IGNORE INTO favourite_components (id, user_id, component_id) VALUES (?, ?, ?)", id, userID, req.ComponentID).Error
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to add favourite")
		return
	}

	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

func removeFavourite(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(UserIDKey).(string)
	if !ok {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	componentID := chi.URLParam(r, "component_id")
	if componentID == "" {
		writeError(w, http.StatusBadRequest, "missing component_id parameter")
		return
	}

	err := db.DB.Exec("DELETE FROM favourite_components WHERE user_id = ? AND component_id = ?", userID, componentID).Error
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to remove favourite")
		return
	}

	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}
