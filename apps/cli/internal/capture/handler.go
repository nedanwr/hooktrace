// Package capture provides the HTTP server that intercepts incoming webhook
// requests, stores them, and broadcasts events to listeners.
package capture

import (
	"sync"

	"github.com/nedanwr/tunnl/apps/cli/internal/store"
)

// Listener is a callback invoked when a new request is captured.
type Listener func(req *store.CapturedRequest)

// Handler captures incoming HTTP requests and manages listeners.
type Handler struct {
	store     store.Store
	mu        sync.RWMutex
	listeners []Listener
}

// NewHandler creates a new capture handler with the given store.
func NewHandler(s store.Store) *Handler {
	return &Handler{
		store: s,
	}
}

// OnRequest registers a listener that is called whenever a request is captured.
func (h *Handler) OnRequest(fn Listener) {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.listeners = append(h.listeners, fn)
}

// Store returns the underlying store for reading captured requests.
func (h *Handler) Store() store.Store {
	return h.store
}

func (h *Handler) broadcast(req *store.CapturedRequest) {
	h.mu.RLock()
	defer h.mu.RUnlock()
	for _, fn := range h.listeners {
		fn(req)
	}
}
