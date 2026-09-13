package db

import (
	"log"
	"os"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func Init() {
	dbPath := os.Getenv("DB_PATH")
	if dbPath == "" {
		dbPath = "pcmaxing.db"
	}

	var err error
	DB, err = gorm.Open(sqlite.Open(dbPath), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Error),
	})
	if err != nil {
		log.Fatalf("Failed to open SQLite database with GORM: %v", err)
	}

	// We still need to ensure the schema is loaded if it's a new db.
	// Since GORM AutoMigrate is normally used, we can just execute the raw schema.sql
	// if the components table doesn't exist.
	var name string
	err = DB.Raw("SELECT name FROM sqlite_master WHERE type='table' AND name='components'").Scan(&name).Error
	if err != nil || name == "" {
		schemaPath := "backend/schema.sql"
		schemaBytes, err := os.ReadFile(schemaPath)
		if err != nil {
			schemaPath = "schema.sql"
			schemaBytes, err = os.ReadFile(schemaPath)
			if err != nil {
				log.Fatalf("Failed to read schema.sql: %v", err)
			}
		}

		err = DB.Exec(string(schemaBytes)).Error
		if err != nil {
			log.Fatalf("Failed to execute schema.sql: %v", err)
		}
		log.Println("Database initialized with schema.sql using GORM")
	}
}
