package handlers

import (
	"encoding/json"
	"log"
	"net/http"
)

// maxParamLen bounds user-supplied query/path parameters to guard against
// abusive (e.g. multi-KB) inputs being forwarded to the upstream API.
const maxParamLen = 100

func writeJSON(w http.ResponseWriter, status int, v interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(v); err != nil {
		log.Printf("writeJSON encode error: %v", err)
	}
}

func writeError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]string{"error": msg})
}
