package main

import (
	"fmt"
	"os"
	"os/signal"
	"syscall"

	"github.com/nedanwr/tunnl/apps/relay/internal/server"
	"github.com/nedanwr/tunnl/apps/relay/internal/tunnel"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

func main() {
	// Configure logging.
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})

	logLevel := os.Getenv("LOG_LEVEL")
	switch logLevel {
	case "debug":
		zerolog.SetGlobalLevel(zerolog.DebugLevel)
	case "warn":
		zerolog.SetGlobalLevel(zerolog.WarnLevel)
	default:
		zerolog.SetGlobalLevel(zerolog.InfoLevel)
	}

	// Read configuration from environment.
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	baseDomain := os.Getenv("BASE_DOMAIN")
	if baseDomain == "" {
		baseDomain = "usetunnl.com"
	}

	// Initialize tunnel manager.
	mgr := tunnel.NewManager()

	// Initialize HTTP + WebSocket server.
	srv := server.New(port, baseDomain, mgr)

	// Handle graceful shutdown.
	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		<-sigCh
		fmt.Println("\nShutting down relay server...")
		if err := srv.Shutdown(); err != nil {
			log.Error().Err(err).Msg("shutdown error")
		}
	}()

	log.Info().Str("port", port).Str("domain", baseDomain).Msg("relay server starting")
	if err := srv.Start(); err != nil {
		log.Fatal().Err(err).Msg("relay server failed")
	}
}
