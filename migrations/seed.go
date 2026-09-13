package main

import (
	"database/sql"
	"fmt"
	"os"
	"strings"

	_ "modernc.org/sqlite"
)

func main() {
	b, err := os.ReadFile("Setup.sql")
	if err != nil {
		panic(err)
	}

	db, err := sql.Open("sqlite", "pcmaxing.db")
	if err != nil {
		panic(err)
	}
	defer db.Close()

	stmts := strings.Split(string(b), ";")
	for _, s := range stmts {
		s = strings.TrimSpace(s)
		if strings.HasPrefix(s, "INSERT INTO") {
			_, err := db.Exec(s)
			if err != nil {
				fmt.Println("Error on insert:", err)
			}
		}
	}
	fmt.Println("Seed completed.")
}
