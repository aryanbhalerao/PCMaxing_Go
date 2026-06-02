package handler

import (
	"net/http"

	"pcmaxing/backend/router"
)

var h http.Handler

func init() {
	h = router.New()
}

// Handler is the Vercel serverless function entry point.
func Handler(w http.ResponseWriter, r *http.Request) {
	h.ServeHTTP(w, r)
}
