// Package inspector serves the embedded React SPA, REST API, and WebSocket
// for the local web inspector.
package inspector

import (
	"encoding/json"
	"net/http"
	"sync"

	"github.com/rs/zerolog/log"
	"golang.org/x/net/websocket"
)

// WSEvent is a message pushed to connected inspector WebSocket clients.
type WSEvent struct {
	Type string      `json:"type"`
	Data interface{} `json:"data"`
}

// WSHub manages WebSocket connections and broadcasts events.
type WSHub struct {
	mu      sync.RWMutex
	clients map[*websocket.Conn]struct{}
}

// NewWSHub creates a new WebSocket hub.
func NewWSHub() *WSHub {
	return &WSHub{
		clients: make(map[*websocket.Conn]struct{}),
	}
}

// Handler returns an http.Handler that upgrades connections to WebSocket.
func (h *WSHub) Handler() http.Handler {
	return websocket.Handler(func(ws *websocket.Conn) {
		h.mu.Lock()
		h.clients[ws] = struct{}{}
		h.mu.Unlock()

		log.Debug().Msg("inspector ws client connected")

		// Keep the connection open — read and discard any messages from client.
		buf := make([]byte, 512)
		for {
			_, err := ws.Read(buf)
			if err != nil {
				break
			}
		}

		h.mu.Lock()
		delete(h.clients, ws)
		h.mu.Unlock()
		ws.Close()
		log.Debug().Msg("inspector ws client disconnected")
	})
}

// Broadcast sends an event to all connected WebSocket clients.
func (h *WSHub) Broadcast(event WSEvent) {
	data, err := json.Marshal(event)
	if err != nil {
		log.Error().Err(err).Msg("failed to marshal ws event")
		return
	}

	h.mu.RLock()
	defer h.mu.RUnlock()

	for ws := range h.clients {
		if _, err := ws.Write(data); err != nil {
			log.Debug().Err(err).Msg("failed to write to ws client")
		}
	}
}

// ClientCount returns the number of connected WebSocket clients.
func (h *WSHub) ClientCount() int {
	h.mu.RLock()
	defer h.mu.RUnlock()
	return len(h.clients)
}
