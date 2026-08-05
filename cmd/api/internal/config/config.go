package config

import (
	"os"
	"strconv"
)

type Config struct {
	DatabaseURL  string
	WorkOSAPIKey string
	WorkOSClientID string
	StripeSecretKey string
	EvidenceSecret string
	S3Bucket      string
	KMSKeyID      string
	Port          string
}

func LoadConfig() (*Config, error) {
	cfg := &Config{
		DatabaseURL:     getEnvOrDefault("DATABASE_URL", "postgres://localhost:5432/ripodoc?sslmode=disable"),
		WorkOSAPIKey:    getEnvOrDefault("WORKOS_API_KEY", ""),
		WorkOSClientID:  getEnvOrDefault("WORKOS_CLIENT_ID", ""),
		StripeSecretKey: getEnvOrDefault("STRIPE_SECRET_KEY", ""),
		EvidenceSecret:  getEnvOrDefault("EVIDENCE_SECRET", ""),
		S3Bucket:        getEnvOrDefault("S3_BUCKET", ""),
		KMSKeyID:        getEnvOrDefault("KMS_KEY_ID", ""),
		Port:            getEnvOrDefault("PORT", "8080"),
	}

	if cfg.WorkOSAPIKey == "" || cfg.WorkOSClientID == "" {
		return nil, fmt.Errorf("WORKOS_API_KEY and WORKOS_CLIENT_ID must be set")
	}

	if len(cfg.EvidenceSecret) < 32 {
		return nil, fmt.Errorf("EVIDENCE_SECRET must be at least 32 characters")
	}

	return cfg, nil
}

func getEnvOrDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func (c *Config) GetPort() string {
	if c.Port != "" {
		return c.Port
	}
	return "8080"
}

func (c *Config) IsDevelopment() bool {
	env := getEnvOrDefault("ENV", "development")
	return env == "development"
}

// toInt is a helper to safely convert string to int
func toInt(s string) int {
	if s == "" {
		return 0
	}
	val, _ := strconv.Atoi(s)
	return val
}