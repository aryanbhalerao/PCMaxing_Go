package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"

	"pcmaxing/backend/db"
)

type SavedBuild struct {
	ID         string          `json:"id"`
	UserID     string          `json:"user_id"`
	Name       string          `json:"name"`
	Parts      json.RawMessage `json:"parts"`
	TotalPrice float64         `json:"total_price"`
	IsPublic   bool            `json:"is_public"`
	CreatedAt  time.Time       `json:"created_at"`
}

type BuildHistory struct {
	ID         string          `json:"id"`
	UserID     string          `json:"user_id"`
	Parts      json.RawMessage `json:"parts"`
	TotalPrice float64         `json:"total_price"`
	CreatedAt  time.Time       `json:"created_at"`
}

func BuildsRouter() chi.Router {
	r := chi.NewRouter()
	r.Get("/popular", getPopularBuilds)
	r.Get("/saved", getSavedBuilds)
	r.Post("/saved", createSavedBuild)
	r.Delete("/saved/{id}", deleteSavedBuild)
	r.Get("/history", getBuildHistory)
	r.Post("/history", addBuildHistory)
	return r
}

func getPopularBuilds(w http.ResponseWriter, r *http.Request) {
	rows, err := db.DB.Raw("SELECT id, name, description, parts, total_price, tier, created_at FROM popular_builds").Rows()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to get popular builds")
		return
	}
	defer rows.Close()

	var builds []map[string]interface{}
	for rows.Next() {
		var id, total_price int
		var name, description, partsStr, tier string
		var createdAt time.Time
		if err := rows.Scan(&id, &name, &description, &partsStr, &total_price, &tier, &createdAt); err != nil {
			continue
		}
		
		builds = append(builds, map[string]interface{}{
			"id": id,
			"name": name,
			"description": description,
			"parts": json.RawMessage(partsStr),
			"total_price": total_price,
			"tier": tier,
			"created_at": createdAt,
		})
	}
	
	if builds == nil {
		builds = []map[string]interface{}{}
	}

	writeJSON(w, http.StatusOK, builds)
}

func getSavedBuilds(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(UserIDKey).(string)
	if !ok {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	rows, err := db.DB.Raw("SELECT id, user_id, name, parts, total_price, is_public, created_at FROM saved_builds WHERE user_id = ?", userID).Rows()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to get saved builds")
		return
	}
	defer rows.Close()

	var builds []SavedBuild
	for rows.Next() {
		var b SavedBuild
		var partsStr string
		var isPublicInt int
		if err := rows.Scan(&b.ID, &b.UserID, &b.Name, &partsStr, &b.TotalPrice, &isPublicInt, &b.CreatedAt); err != nil {
			continue
		}
		b.Parts = json.RawMessage(partsStr)
		b.IsPublic = isPublicInt == 1
		builds = append(builds, b)
	}

	if builds == nil {
		builds = []SavedBuild{}
	}
	writeJSON(w, http.StatusOK, builds)
}

func createSavedBuild(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(UserIDKey).(string)
	if !ok {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var req struct {
		Name       string          `json:"name"`
		Parts      json.RawMessage `json:"parts"`
		TotalPrice float64         `json:"total_price"`
		IsPublic   bool            `json:"is_public"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request")
		return
	}

	id := uuid.New().String()
	isPublicInt := 0
	if req.IsPublic {
		isPublicInt = 1
	}
	
	err := db.DB.Exec("INSERT INTO saved_builds (id, user_id, name, parts, total_price, is_public) VALUES (?, ?, ?, ?, ?, ?)", id, userID, req.Name, string(req.Parts), req.TotalPrice, isPublicInt).Error
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to create saved build")
		return
	}

	var b SavedBuild
	var partsStr string
	var isPub int
	err = db.DB.Raw("SELECT id, user_id, name, parts, total_price, is_public, created_at FROM saved_builds WHERE id = ?", id).Row().Scan(&b.ID, &b.UserID, &b.Name, &partsStr, &b.TotalPrice, &isPub, &b.CreatedAt)
	if err == nil {
		b.Parts = json.RawMessage(partsStr)
		b.IsPublic = isPub == 1
		writeJSON(w, http.StatusOK, b)
	} else {
		writeError(w, http.StatusInternalServerError, "failed to fetch created saved build")
	}
}

func deleteSavedBuild(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(UserIDKey).(string)
	if !ok {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	id := chi.URLParam(r, "id")
	if id == "" {
		writeError(w, http.StatusBadRequest, "missing id parameter")
		return
	}

	err := db.DB.Exec("DELETE FROM saved_builds WHERE id = ? AND user_id = ?", id, userID).Error
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to delete build")
		return
	}

	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

func getBuildHistory(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(UserIDKey).(string)
	if !ok {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	rows, err := db.DB.Raw("SELECT id, user_id, parts, total_price, created_at FROM build_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 3", userID).Rows()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to get build history")
		return
	}
	defer rows.Close()

	var history []BuildHistory
	for rows.Next() {
		var h BuildHistory
		var partsStr string
		if err := rows.Scan(&h.ID, &h.UserID, &partsStr, &h.TotalPrice, &h.CreatedAt); err != nil {
			continue
		}
		h.Parts = json.RawMessage(partsStr)
		history = append(history, h)
	}

	if history == nil {
		history = []BuildHistory{}
	}
	writeJSON(w, http.StatusOK, history)
}

func addBuildHistory(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(UserIDKey).(string)
	if !ok {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var req struct {
		Parts      json.RawMessage `json:"parts"`
		TotalPrice float64         `json:"total_price"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request")
		return
	}

	rows, err := db.DB.Raw("SELECT id FROM build_history WHERE user_id = ? ORDER BY created_at DESC", userID).Rows()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to get existing history")
		return
	}
	
	var ids []string
	for rows.Next() {
		var id string
		if err := rows.Scan(&id); err == nil {
			ids = append(ids, id)
		}
	}
	rows.Close()

	if len(ids) >= 3 {
		// Delete the oldest
		oldest := ids[len(ids)-1]
		err = db.DB.Exec("DELETE FROM build_history WHERE id = ?", oldest).Error
		if err != nil {
			writeError(w, http.StatusInternalServerError, "failed to prune history")
			return
		}
	}

	id := uuid.New().String()
	err = db.DB.Exec("INSERT INTO build_history (id, user_id, parts, total_price) VALUES (?, ?, ?, ?)", id, userID, string(req.Parts), req.TotalPrice).Error
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to create history entry")
		return
	}

	var h BuildHistory
	var partsStr string
	err = db.DB.Raw("SELECT id, user_id, parts, total_price, created_at FROM build_history WHERE id = ?", id).Row().Scan(&h.ID, &h.UserID, &partsStr, &h.TotalPrice, &h.CreatedAt)
	if err == nil {
		h.Parts = json.RawMessage(partsStr)
		writeJSON(w, http.StatusOK, h)
	} else {
		writeError(w, http.StatusInternalServerError, "failed to fetch created history entry")
	}
}

