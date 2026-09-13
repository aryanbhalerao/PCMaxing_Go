package main

import (
	"fmt"
	"os"
	"strings"
)

func main() {
	b, err := os.ReadFile("Setup.sql")
	if err != nil {
		panic(err)
	}

	content := string(b)
	stmts := strings.Split(content, ";")
	
	var inserts []string
	for _, s := range stmts {
		s = strings.TrimSpace(s)
		// strip comments before checking
		lines := strings.Split(s, "\n")
		var cleanLines []string
		for _, l := range lines {
			if !strings.HasPrefix(strings.TrimSpace(l), "--") {
				cleanLines = append(cleanLines, l)
			}
		}
		cleanS := strings.TrimSpace(strings.Join(cleanLines, "\n"))
		
		if strings.HasPrefix(cleanS, "INSERT") {
			inserts = append(inserts, cleanS+";")
		}
	}
	
	schema, err := os.ReadFile("backend/schema.sql")
	if err != nil {
		panic(err)
	}
	
	// Remove existing inserts in schema.sql to avoid duplication
	schemaLines := strings.Split(string(schema), "\n")
	var newSchema []string
	for _, l := range schemaLines {
		if strings.HasPrefix(l, "-- Insert CPUs") || strings.HasPrefix(l, "INSERT INTO components") || strings.HasPrefix(l, "('CPU'") || strings.HasPrefix(l, "('GPU'") || strings.HasPrefix(l, "-- Insert GPUs") || strings.HasPrefix(l, "INSERT INTO popular_builds") || strings.HasPrefix(l, "('AMD Budget") || strings.HasPrefix(l, " '[") || strings.HasPrefix(l, "   {") || strings.HasPrefix(l, " ]',") {
			continue // skip these
		}
		newSchema = append(newSchema, l)
	}
	// Better way: just take schema.sql until the first "-- Insert"
	firstInsert := strings.Index(string(schema), "-- Insert CPUs")
	if firstInsert != -1 {
		schema = schema[:firstInsert]
	}
	
	finalSchema := string(schema) + "\n\n" + strings.Join(inserts, "\n\n")
	os.WriteFile("backend/schema.sql", []byte(finalSchema), 0644)
	fmt.Println("Updated schema.sql with all inserts.")
}
