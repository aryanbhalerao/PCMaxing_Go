package main

import (
	"database/sql"
	"fmt"

	_ "modernc.org/sqlite"
)

func main() {
	db, err := sql.Open("sqlite", "pcmaxing.db")
	if err != nil {
		panic(err)
	}
	defer db.Close()

	_, err = db.Exec(`
		INSERT INTO popular_builds (name, description, parts, total_price, tier) 
		SELECT name, 'A popular community build', parts, total_price, 'Mid-Range' 
		FROM saved_builds
	`)
	if err != nil {
		fmt.Println("Error:", err)
	} else {
		fmt.Println("Copied saved builds to popular builds!")
	}
}
