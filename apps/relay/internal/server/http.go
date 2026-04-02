// Package server implements the relay HTTP and WebSocket server.
package server

import (
	"crypto/rand"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/nedanwr/tunnl/apps/relay/internal/tunnel"
	"github.com/rs/zerolog/log"
)

// Server is the relay HTTP server that routes incoming webhooks to tunnels.
type Server struct {
	httpServer *http.Server
	manager    *tunnel.Manager
	baseDomain string
	port       string
}

// New creates a new relay server.
func New(port, baseDomain string, mgr *tunnel.Manager) *Server {
	s := &Server{
		manager:    mgr,
		baseDomain: baseDomain,
		port:       port,
	}

	mux := http.NewServeMux()

	// WebSocket endpoint for CLI tunnel connections.
	mux.HandleFunc("/_tunnel/ws", s.handleTunnelWS)

	// Health check.
	mux.HandleFunc("/_tunnel/health", s.handleHealth)

	// Status endpoint.
	mux.HandleFunc("/_tunnel/status", s.handleStatus)

	// All other requests are routed based on subdomain.
	mux.HandleFunc("/", s.handleIncoming)

	s.httpServer = &http.Server{
		Addr:         ":" + port,
		Handler:      mux,
		ReadTimeout:  60 * time.Second,
		WriteTimeout: 60 * time.Second,
	}

	return s
}

// Start begins listening. Blocks until shut down.
func (s *Server) Start() error {
	return s.httpServer.ListenAndServe()
}

// Shutdown gracefully shuts down the server.
func (s *Server) Shutdown() error {
	return s.httpServer.Close()
}

// handleHealth returns a simple health check response.
func (s *Server) handleHealth(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, `{"status":"ok","tunnels":%d}`, s.manager.ActiveCount())
}

// handleStatus returns relay server status.
func (s *Server) handleStatus(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	resp := map[string]interface{}{
		"status":        "ok",
		"activeTunnels": s.manager.ActiveCount(),
		"baseDomain":    s.baseDomain,
	}
	json.NewEncoder(w).Encode(resp)
}

// handleIncoming routes incoming HTTP requests to the appropriate tunnel based on subdomain.
func (s *Server) handleIncoming(w http.ResponseWriter, r *http.Request) {
	// Extract subdomain from Host header.
	subdomain := s.extractSubdomain(r.Host)
	if subdomain == "" {
		// No subdomain — serve a simple landing page or 404.
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		fmt.Fprintf(w, `{"service":"tunnl-relay","domain":"%s"}`, s.baseDomain)
		return
	}

	// Look up the tunnel for this subdomain.
	t := s.manager.Lookup(subdomain)
	if t == nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		fmt.Fprintf(w, `{"error":"tunnel not found","subdomain":"%s"}`, subdomain)
		return
	}

	// Read the incoming request body.
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "failed to read request body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	// Generate a unique request ID.
	requestID := generateRequestID()

	// Encode body as base64 for safe JSON transport.
	bodyB64 := ""
	if len(body) > 0 {
		bodyB64 = base64.StdEncoding.EncodeToString(body)
	}

	// Register pending response channel.
	respCh := t.AddPending(requestID)

	// Forward the request to the CLI via WebSocket.
	reqMsg := tunnel.Message{
		Type: tunnel.TypeRequest,
		Data: tunnel.RequestData{
			RequestID: requestID,
			Method:    r.Method,
			Path:      r.URL.Path,
			Query:     r.URL.RawQuery,
			Headers:   r.Header.Clone(),
			Body:      bodyB64,
		},
	}

	if err := t.Conn.WriteJSON(reqMsg); err != nil {
		log.Error().Err(err).
			Str("tunnelId", t.ID).
			Str("requestId", requestID).
			Msg("failed to forward request to tunnel")
		http.Error(w, "tunnel connection error", http.StatusBadGateway)
		return
	}

	log.Debug().
		Str("subdomain", subdomain).
		Str("method", r.Method).
		Str("path", r.URL.Path).
		Str("requestId", requestID).
		Msg("request forwarded to tunnel")

	// Wait for the CLI to respond (with timeout).
	select {
	case resp, ok := <-respCh:
		if !ok || resp == nil {
			// Channel closed — tunnel disconnected.
			http.Error(w, "tunnel disconnected", http.StatusBadGateway)
			return
		}

		// Write response headers.
		for k, vals := range resp.Headers {
			for _, v := range vals {
				w.Header().Add(k, v)
			}
		}

		// Decode base64 response body.
		var respBody []byte
		if resp.Body != "" {
			respBody, err = base64.StdEncoding.DecodeString(resp.Body)
			if err != nil {
				log.Error().Err(err).Msg("failed to decode response body")
				http.Error(w, "invalid response body", http.StatusBadGateway)
				return
			}
		}

		w.WriteHeader(resp.StatusCode)
		if len(respBody) > 0 {
			w.Write(respBody)
		}

	case <-time.After(30 * time.Second):
		http.Error(w, "tunnel response timeout", http.StatusGatewayTimeout)
	}
}

// extractSubdomain extracts the subdomain from a host like "abc123.usetunnl.com".
func (s *Server) extractSubdomain(host string) string {
	// Strip port if present.
	if idx := strings.LastIndex(host, ":"); idx != -1 {
		host = host[:idx]
	}

	// Check if the host ends with our base domain.
	suffix := "." + s.baseDomain
	if !strings.HasSuffix(host, suffix) {
		return ""
	}

	subdomain := strings.TrimSuffix(host, suffix)
	if subdomain == "" || strings.Contains(subdomain, ".") {
		return ""
	}

	return subdomain
}

func generateRequestID() string {
	b := make([]byte, 8)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}
