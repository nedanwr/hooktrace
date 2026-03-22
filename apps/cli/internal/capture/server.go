package capture

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/nedanwr/hooktrace/apps/cli/internal/store"
	"github.com/rs/zerolog/log"
)

// Server is the HTTP server that listens for incoming webhooks on the capture port.
type Server struct {
	handler    *Handler
	httpServer *http.Server
	port       int
}

// NewServer creates a capture server listening on the given port.
func NewServer(port int, handler *Handler) *Server {
	s := &Server{
		handler: handler,
		port:    port,
	}
	mux := http.NewServeMux()
	mux.HandleFunc("/", s.handleRequest)
	s.httpServer = &http.Server{
		Addr:         fmt.Sprintf(":%d", port),
		Handler:      mux,
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 30 * time.Second,
	}
	return s
}

// Port returns the capture server port.
func (s *Server) Port() int {
	return s.port
}

// Start begins listening. It blocks until the server is shut down.
func (s *Server) Start() error {
	log.Info().Int("port", s.port).Msg("capture server listening")
	return s.httpServer.ListenAndServe()
}

// Shutdown gracefully shuts down the capture server.
func (s *Server) Shutdown() error {
	return s.httpServer.Close()
}

func (s *Server) handleRequest(w http.ResponseWriter, r *http.Request) {
	start := time.Now()

	body, err := io.ReadAll(r.Body)
	if err != nil {
		log.Error().Err(err).Msg("failed to read request body")
		http.Error(w, "failed to read body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	captured := &store.CapturedRequest{
		ID:        generateID(),
		Method:    r.Method,
		Path:      r.URL.Path,
		Query:     r.URL.RawQuery,
		Headers:   r.Header.Clone(),
		Body:      body,
		Timestamp: start,
	}

	// Store the request immediately (response will be attached after forwarding).
	s.handler.store.Add(captured)

	// Write a simple acknowledgement — the forwarder will handle the real forwarding
	// asynchronously if configured. In Phase 1, we integrate forwarding inline in the
	// start command pipeline: capture → forward → update store → broadcast.
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, `{"status":"captured","id":"%s"}`, captured.ID)

	captured.Duration = time.Since(start)

	s.handler.broadcast(captured)
}

func generateID() string {
	b := make([]byte, 8)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}
