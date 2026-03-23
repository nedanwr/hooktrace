package server

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/websocket"
	"github.com/nedanwr/hooktrace/apps/relay/internal/tunnel"
	"github.com/rs/zerolog/log"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins for CLI connections.
	},
}

// handleTunnelWS handles WebSocket connections from CLI clients.
func (s *Server) handleTunnelWS(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Error().Err(err).Msg("websocket upgrade failed")
		return
	}

	log.Debug().Str("remote", r.RemoteAddr).Msg("new websocket connection")

	// Read the first message — must be TUNNEL_REGISTER.
	var msg tunnel.Message
	if err := conn.ReadJSON(&msg); err != nil {
		log.Error().Err(err).Msg("failed to read register message")
		conn.Close()
		return
	}

	if msg.Type != tunnel.TypeRegister {
		s.sendError(conn, "INVALID_MESSAGE", "expected TUNNEL_REGISTER as first message")
		conn.Close()
		return
	}

	// Parse register data.
	dataBytes, err := json.Marshal(msg.Data)
	if err != nil {
		s.sendError(conn, "INVALID_DATA", "failed to parse register data")
		conn.Close()
		return
	}

	var regData tunnel.RegisterData
	if err := json.Unmarshal(dataBytes, &regData); err != nil {
		s.sendError(conn, "INVALID_DATA", "failed to parse register data")
		conn.Close()
		return
	}

	if regData.ClientID == "" {
		s.sendError(conn, "MISSING_CLIENT_ID", "clientId is required")
		conn.Close()
		return
	}

	// Register the tunnel.
	t, err := s.manager.Register(regData.ClientID, regData.RequestedSubdomain, conn)
	if err != nil {
		s.sendError(conn, "REGISTRATION_FAILED", err.Error())
		conn.Close()
		return
	}

	// Send TUNNEL_REGISTERED response.
	publicURL := "https://" + t.Subdomain + "." + s.baseDomain
	if err := conn.WriteJSON(tunnel.Message{
		Type: tunnel.TypeRegistered,
		Data: tunnel.RegisteredData{
			Subdomain: t.Subdomain,
			PublicURL: publicURL,
			TunnelID:  t.ID,
		},
	}); err != nil {
		log.Error().Err(err).Msg("failed to send registered message")
		s.manager.Remove(t)
		conn.Close()
		return
	}

	// Start reading messages from the CLI client.
	s.readLoop(t)
}

// readLoop reads messages from a tunnel client until the connection closes.
func (s *Server) readLoop(t *tunnel.Tunnel) {
	defer func() {
		s.manager.Remove(t)
		t.Conn.Close()
	}()

	for {
		var msg tunnel.Message
		if err := t.Conn.ReadJSON(&msg); err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseNormalClosure) {
				log.Debug().Err(err).Str("tunnelId", t.ID).Msg("tunnel connection error")
			}
			return
		}

		switch msg.Type {
		case tunnel.TypeResponse:
			s.handleTunnelResponse(t, msg.Data)

		case tunnel.TypePong:
			// Keepalive acknowledged — nothing to do.
			log.Debug().Str("tunnelId", t.ID).Msg("pong received")

		default:
			log.Debug().
				Str("type", msg.Type).
				Str("tunnelId", t.ID).
				Msg("unknown message type from client")
		}
	}
}

// handleTunnelResponse delivers a response from the CLI back to the waiting HTTP handler.
func (s *Server) handleTunnelResponse(t *tunnel.Tunnel, data interface{}) {
	dataBytes, err := json.Marshal(data)
	if err != nil {
		log.Error().Err(err).Msg("failed to marshal response data")
		return
	}

	var respData tunnel.ResponseData
	if err := json.Unmarshal(dataBytes, &respData); err != nil {
		log.Error().Err(err).Msg("failed to parse response data")
		return
	}

	t.ResolvePending(respData.RequestID, &respData)
}

// sendError sends a TUNNEL_ERROR message to the client.
func (s *Server) sendError(conn *websocket.Conn, code, message string) {
	_ = conn.WriteJSON(tunnel.Message{
		Type: tunnel.TypeError,
		Data: tunnel.ErrorData{
			Code:    code,
			Message: message,
		},
	})
}
