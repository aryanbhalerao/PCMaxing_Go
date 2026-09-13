package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"math/rand"
	"net/http"
	"time"
)

const baseURL = "http://localhost:5000/api"

type User struct {
	Username string
	Email    string
	Password string
}

func main() {
	rand.Seed(time.Now().UnixNano())

	// Fetch categories and components
	resp, err := http.Get(baseURL + "/components")
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	var allComps []map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&allComps)

	compsByCat := make(map[string][]map[string]interface{})
	for _, c := range allComps {
		cat := c["category"].(string)
		compsByCat[cat] = append(compsByCat[cat], c)
	}

	fmt.Printf("Loaded components for %d categories\n", len(compsByCat))

	// Create 5 users
	var tokens []string
	for i := 1; i <= 5; i++ {
		u := User{
			Username: fmt.Sprintf("user%d_%d", i, rand.Intn(10000)),
			Email:    fmt.Sprintf("user%d_%d@test.com", i, rand.Intn(10000)),
			Password: "password123",
		}
		
		body, _ := json.Marshal(map[string]string{
			"email":    u.Email,
			"username": u.Username,
			"password": u.Password,
		})
		
		res, err := http.Post(baseURL+"/auth/signup", "application/json", bytes.NewBuffer(body))
		if err != nil {
			fmt.Println("Error signing up:", err)
			continue
		}
		
		var authRes map[string]interface{}
		json.NewDecoder(res.Body).Decode(&authRes)
		res.Body.Close()
		
		if token, ok := authRes["token"].(string); ok {
			tokens = append(tokens, token)
			fmt.Println("Created user:", u.Username)
		} else {
			fmt.Println("Signup failed:", authRes)
		}
	}

	if len(tokens) == 0 {
		fmt.Println("No users created, exiting")
		return
	}

	// Create 50 builds
	categories := []string{"CPU", "GPU", "Motherboard", "RAM", "Storage", "PSU", "Case"}
	
	for i := 1; i <= 50; i++ {
		token := tokens[rand.Intn(len(tokens))]
		
		parts := make(map[string]interface{})
		totalPrice := 0.0
		
		for _, cat := range categories {
			catComps := compsByCat[cat]
			if len(catComps) > 0 {
				comp := catComps[rand.Intn(len(catComps))]
				parts[cat] = comp
				if price, ok := comp["price"].(float64); ok {
					totalPrice += price
				}
			}
		}

		// Check compatibility
		compatBody, _ := json.Marshal(map[string]interface{}{"parts": parts})
		compatRes, err := http.Post(baseURL+"/compatibility", "application/json", bytes.NewBuffer(compatBody))
		if err == nil {
			var compat map[string]interface{}
			json.NewDecoder(compatRes.Body).Decode(&compat)
			compatRes.Body.Close()
			if issues, ok := compat["issues"].([]interface{}); ok && len(issues) > 0 {
				fmt.Printf("Build %d has %d compatibility issues\n", i, len(issues))
			}
		}

		// Save build
		buildBody, _ := json.Marshal(map[string]interface{}{
			"name":        fmt.Sprintf("Awesome Build %d", i),
			"parts":       parts,
			"total_price": totalPrice,
			"is_public":   true,
		})
		
		req, _ := http.NewRequest("POST", baseURL+"/builds/saved", bytes.NewBuffer(buildBody))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+token)
		
		client := &http.Client{}
		saveRes, err := client.Do(req)
		if err == nil {
			saveRes.Body.Close()
			if saveRes.StatusCode == 200 {
				fmt.Printf("Successfully created build %d\n", i)
			} else {
				b, _ := ioutil.ReadAll(saveRes.Body)
				fmt.Printf("Failed to create build %d: %s\n", i, string(b))
			}
		}
	}
	fmt.Println("Done creating 50 builds.")
}
