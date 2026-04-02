package inspector

import (
	"fmt"
	"io/fs"
	"net/http"
	"time"

	"github.com/nedanwr/tunnl/apps/cli/internal/replay"
	"github.com/nedanwr/tunnl/apps/cli/internal/store"
	"github.com/rs/zerolog/log"
)

// Server serves the embedded inspector SPA, REST API, and WebSocket.
type Server struct {
	httpServer *http.Server
	hub        *WSHub
	api        *API
	port       int
}

// NewServer creates an inspector server on the given port.
// webFS should be the embedded filesystem containing the built React app (or nil for API-only mode).
func NewServer(port int, s store.Store, webFS fs.FS) *Server {
	hub := NewWSHub()
	api := NewAPI(s)

	mux := http.NewServeMux()

	// Register API routes.
	api.RegisterRoutes(mux)

	// WebSocket endpoint.
	mux.Handle("/ws", hub.Handler())

	// Serve embedded SPA — fallback all non-API routes to index.html.
	if webFS != nil {
		fileServer := http.FileServerFS(webFS)
		mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
			// Try to serve the file directly first.
			// If it doesn't exist, serve index.html for client-side routing.
			path := r.URL.Path
			if path == "/" {
				path = "/index.html"
			}

			// Check if the file exists in the embedded FS.
			if _, err := fs.Stat(webFS, path[1:]); err == nil {
				fileServer.ServeHTTP(w, r)
				return
			}

			// Serve index.html for client-side routing.
			r.URL.Path = "/"
			fileServer.ServeHTTP(w, r)
		})
	}

	// Wrap mux with CORS middleware for development.
	handler := corsMiddleware(mux)

	srv := &Server{
		httpServer: &http.Server{
			Addr:         fmt.Sprintf(":%d", port),
			Handler:      handler,
			ReadTimeout:  30 * time.Second,
			WriteTimeout: 30 * time.Second,
		},
		hub:  hub,
		api:  api,
		port: port,
	}

	return srv
}

// SetReplayer configures the replay/mock handler for the inspector API.
func (s *Server) SetReplayer(r *replay.Replayer) {
	s.api.SetReplayer(r)
}

// Port returns the inspector server port.
func (s *Server) Port() int {
	return s.port
}

// Hub returns the WebSocket hub for broadcasting events.
func (s *Server) Hub() *WSHub {
	return s.hub
}

// Start begins listening. It blocks until the server is shut down.
func (s *Server) Start() error {
	log.Info().Int("port", s.port).Msg("inspector server listening")
	return s.httpServer.ListenAndServe()
}

// Shutdown gracefully shuts down the inspector server.
func (s *Server) Shutdown() error {
	return s.httpServer.Close()
}

// corsMiddleware adds CORS headers for local development (Vite dev server on different port).
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}
