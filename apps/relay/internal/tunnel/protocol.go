// Package tunnel manages WebSocket tunnels between the relay server and CLI clients.
package tunnel

import "net/http"

// Message types for the tunnel WebSocket protocol.
const (
	TypeRegister    = "TUNNEL_REGISTER"
	TypeRegistered  = "TUNNEL_REGISTERED"
	TypeError       = "TUNNEL_ERROR"
	TypeRequest     = "TUNNEL_REQUEST"
	TypeResponse    = "TUNNEL_RESPONSE"
	TypePing        = "TUNNEL_PING"
	TypePong        = "TUNNEL_PONG"
	TypeDisconnect  = "TUNNEL_DISCONNECT"
)

// Message is the envelope for all tunnel WebSocket messages.
type Message struct {
	Type string      `json:"type"`
	Data interface{} `json:"data,omitempty"`
}

// RegisterData is sent by the CLI to register a tunnel.
type RegisterData struct {
	ClientID           string `json:"clientId"`
	AuthToken          string `json:"authToken,omitempty"`
	RequestedSubdomain string `json:"requestedSubdomain,omitempty"`
}

// RegisteredData is the relay's response on successful tunnel registration.
type RegisteredData struct {
	Subdomain string `json:"subdomain"`
	PublicURL string `json:"publicUrl"`
	TunnelID  string `json:"tunnelId"`
}

// ErrorData is sent by the relay when an error occurs.
type ErrorData struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

// RequestData is an incoming HTTP request forwarded from the relay to the CLI.
type RequestData struct {
	RequestID string      `json:"requestId"`
	Method    string      `json:"method"`
	Path      string      `json:"path"`
	Query     string      `json:"query,omitempty"`
	Headers   http.Header `json:"headers"`
	Body      string      `json:"body,omitempty"` // base64-encoded
}

// ResponseData is the CLI's response sent back to the relay.
type ResponseData struct {
	RequestID  string      `json:"requestId"`
	StatusCode int         `json:"statusCode"`
	Headers    http.Header `json:"headers"`
	Body       string      `json:"body,omitempty"` // base64-encoded
}
