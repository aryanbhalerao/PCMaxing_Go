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

	rows, err := db.Query("SELECT category, count(*) FROM components GROUP BY category")
	if err != nil {
		panic(err)
	}
	defer rows.Close()

	fmt.Println("Categories found:")
	for rows.Next() {
		var cat string
		var count int
		rows.Scan(&cat, &count)
		fmt.Printf("%s: %d\n", cat, count)
	}
}
