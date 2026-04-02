// Package config manages the persistent CLI configuration stored in ~/.tunnl/config.yaml.
package config

import (
	"crypto/rand"
	"encoding/hex"
	"os"
	"path/filepath"

	"github.com/rs/zerolog/log"
	"gopkg.in/yaml.v3"
)

const (
	configDir  = ".tunnl"
	configFile = "config.yaml"
)

// Config holds persistent CLI configuration.
type Config struct {
	// ClientID is a stable identifier for this CLI installation.
	ClientID string `yaml:"client_id"`

	// Subdomain is the random subdomain assigned to this client (persisted for stability).
	Subdomain string `yaml:"subdomain,omitempty"`

	// RelayURL is the relay server URL (overridable for development).
	RelayURL string `yaml:"relay_url,omitempty"`
}

// Load reads the config from ~/.tunnl/config.yaml.
// If the file doesn't exist, a new config with a fresh ClientID is created and saved.
func Load() (*Config, error) {
	path, err := configPath()
	if err != nil {
		return nil, err
	}

	cfg := &Config{}

	data, err := os.ReadFile(path)
	if err != nil {
		if os.IsNotExist(err) {
			// Create a new config with a generated client ID.
			cfg.ClientID = generateClientID()
			if err := cfg.Save(); err != nil {
				return nil, err
			}
			log.Debug().Str("clientId", cfg.ClientID).Msg("created new config")
			return cfg, nil
		}
		return nil, err
	}

	if err := yaml.Unmarshal(data, cfg); err != nil {
		return nil, err
	}

	// Ensure client ID exists (upgrade from older config).
	if cfg.ClientID == "" {
		cfg.ClientID = generateClientID()
		if err := cfg.Save(); err != nil {
			return nil, err
		}
	}

	return cfg, nil
}

// Save writes the config to ~/.tunnl/config.yaml.
func (c *Config) Save() error {
	path, err := configPath()
	if err != nil {
		return err
	}

	// Ensure directory exists.
	dir := filepath.Dir(path)
	if err := os.MkdirAll(dir, 0700); err != nil {
		return err
	}

	data, err := yaml.Marshal(c)
	if err != nil {
		return err
	}

	return os.WriteFile(path, data, 0600)
}

func configPath() (string, error) {
	home, err := os.UserHomeDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(home, configDir, configFile), nil
}

func generateClientID() string {
	b := make([]byte, 16)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}
