package main

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"pcmaxing/backend/router"
	"pcmaxing/backend/db"
	"os"
)

func TestMain(m *testing.M) {
	// Setup test database
	os.Setenv("DB_PATH", "test.db")
	db.Init()
	
	// Run tests
	code := m.Run()
	
	// Teardown
	os.Remove("test.db")
	os.Exit(code)
}

func TestGetComponents(t *testing.T) {
	r := router.New()
	
	req, _ := http.NewRequest("GET", "/api/components", nil)
	rr := httptest.NewRecorder()
	
	r.ServeHTTP(rr, req)
	
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("handler returned wrong status code: got %v want %v", status, http.StatusOK)
	}
}

func TestGetCategories(t *testing.T) {
	r := router.New()
	
	req, _ := http.NewRequest("GET", "/api/categories", nil)
	rr := httptest.NewRecorder()
	
	r.ServeHTTP(rr, req)
	
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("handler returned wrong status code: got %v want %v", status, http.StatusOK)
	}
}

func TestGetPopularBuilds(t *testing.T) {
	r := router.New()
	
	req, _ := http.NewRequest("GET", "/api/builds/popular", nil)
	rr := httptest.NewRecorder()
	
	r.ServeHTTP(rr, req)
	
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("handler returned wrong status code: got %v want %v", status, http.StatusOK)
	}
}
