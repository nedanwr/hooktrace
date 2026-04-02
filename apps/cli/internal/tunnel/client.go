// Package tunnel provides the WebSocket client that connects to the relay server
// to establish a public tunnel URL.
package tunnel

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/nedanwr/tunnl/apps/cli/internal/store"
	"github.com/rs/zerolog/log"
	"golang.org/x/net/websocket"
)

// Message types for the tunnel WebSocket protocol.
const (
	TypeRegister   = "TUNNEL_REGISTER"
	TypeRegistered = "TUNNEL_REGISTERED"
	TypeError      = "TUNNEL_ERROR"
	TypeRequest    = "TUNNEL_REQUEST"
	TypeResponse   = "TUNNEL_RESPONSE"
	TypePing       = "TUNNEL_PING"
	TypePong       = "TUNNEL_PONG"
	TypeDisconnect = "TUNNEL_DISCONNECT"
)

// Message is the envelope for all tunnel WebSocket messages.
type Message struct {
	Type string      `json:"type"`
	Data interface{} `json:"data,omitempty"`
}

// RegisterData is sent to the relay to register a tunnel.
type RegisterData struct {
	ClientID           string `json:"clientId"`
	AuthToken          string `json:"authToken,omitempty"`
	RequestedSubdomain string `json:"requestedSubdomain,omitempty"`
}

// RegisteredData is the relay's successful registration response.
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

// RequestData is an incoming HTTP request forwarded from the relay.
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

// RequestHandler is called when a tunnel request arrives.
// It should process the request through the capture → forward pipeline
// and return the response.
type RequestHandler func(req *store.CapturedRequest)

// Client connects to the relay server and manages the tunnel.
type Client struct {
	relayURL  string
	clientID  string
	subdomain string
	conn      *websocket.Conn
	handler   RequestHandler

	mu        sync.Mutex
	connected bool
	tunnelID  string
	publicURL string

	// stopCh signals the client to stop.
	stopCh chan struct{}
}

// NewClient creates a new tunnel client.
func NewClient(relayURL, clientID, subdomain string, handler RequestHandler) *Client {
	return &Client{
		relayURL:  relayURL,
		clientID:  clientID,
		subdomain: subdomain,
		handler:   handler,
		stopCh:    make(chan struct{}),
	}
}

// Connect establishes a WebSocket connection to the relay and registers the tunnel.
// Returns the public URL on success.
func (c *Client) Connect() (string, error) {
	// Build WebSocket URL.
	wsURL := c.relayURL + "/_tunnel/ws"

	log.Debug().Str("url", wsURL).Msg("connecting to relay")

	conn, err := websocket.Dial(wsURL, "", "http://localhost")
	if err != nil {
		return "", fmt.Errorf("connecting to relay: %w", err)
	}

	c.mu.Lock()
	c.conn = conn
	c.mu.Unlock()

	// Send TUNNEL_REGISTER.
	regMsg := Message{
		Type: TypeRegister,
		Data: RegisterData{
			ClientID:           c.clientID,
			RequestedSubdomain: c.subdomain,
		},
	}

	if err := websocket.JSON.Send(conn, regMsg); err != nil {
		conn.Close()
		return "", fmt.Errorf("sending register message: %w", err)
	}

	// Read the response.
	var resp Message
	if err := websocket.JSON.Receive(conn, &resp); err != nil {
		conn.Close()
		return "", fmt.Errorf("reading register response: %w", err)
	}

	switch resp.Type {
	case TypeRegistered:
		dataBytes, _ := json.Marshal(resp.Data)
		var regData RegisteredData
		if err := json.Unmarshal(dataBytes, &regData); err != nil {
			conn.Close()
			return "", fmt.Errorf("parsing registered response: %w", err)
		}

		c.mu.Lock()
		c.connected = true
		c.tunnelID = regData.TunnelID
		c.publicURL = regData.PublicURL
		c.mu.Unlock()

		log.Info().
			Str("publicUrl", regData.PublicURL).
			Str("subdomain", regData.Subdomain).
			Msg("tunnel established")

		return regData.PublicURL, nil

	case TypeError:
		conn.Close()
		dataBytes, _ := json.Marshal(resp.Data)
		var errData ErrorData
		json.Unmarshal(dataBytes, &errData)
		return "", fmt.Errorf("tunnel registration failed: %s — %s", errData.Code, errData.Message)

	default:
		conn.Close()
		return "", fmt.Errorf("unexpected response type: %s", resp.Type)
	}
}

// Listen reads incoming tunnel requests and processes them. Blocks until
// the connection is closed or Stop is called.
func (c *Client) Listen() error {
	c.mu.Lock()
	conn := c.conn
	c.mu.Unlock()

	if conn == nil {
		return fmt.Errorf("not connected")
	}

	// Start keepalive pinger in background.
	go c.keepalive()

	for {
		select {
		case <-c.stopCh:
			return nil
		default:
		}

		var msg Message
		if err := websocket.JSON.Receive(conn, &msg); err != nil {
			if err == io.EOF {
				log.Info().Msg("tunnel connection closed by relay")
				return nil
			}
			c.mu.Lock()
			c.connected = false
			c.mu.Unlock()
			return fmt.Errorf("reading tunnel message: %w", err)
		}

		switch msg.Type {
		case TypeRequest:
			go c.handleRequest(msg.Data)

		case TypePing:
			// Respond with PONG.
			c.mu.Lock()
			_ = websocket.JSON.Send(c.conn, Message{Type: TypePong})
			c.mu.Unlock()

		case TypeDisconnect:
			log.Warn().Msg("forced disconnect from relay")
			c.mu.Lock()
			c.connected = false
			c.mu.Unlock()
			return fmt.Errorf("disconnected by relay")

		default:
			log.Debug().Str("type", msg.Type).Msg("unknown message from relay")
		}
	}
}

// handleRequest processes an incoming tunnel request.
func (c *Client) handleRequest(data interface{}) {
	dataBytes, err := json.Marshal(data)
	if err != nil {
		log.Error().Err(err).Msg("failed to marshal request data")
		return
	}

	var reqData RequestData
	if err := json.Unmarshal(dataBytes, &reqData); err != nil {
		log.Error().Err(err).Msg("failed to parse request data")
		return
	}

	// Decode base64 body.
	var body []byte
	if reqData.Body != "" {
		body, err = base64.StdEncoding.DecodeString(reqData.Body)
		if err != nil {
			log.Error().Err(err).Msg("failed to decode request body")
			return
		}
	}

	// Build a CapturedRequest from the tunnel data.
	captured := &store.CapturedRequest{
		ID:        reqData.RequestID,
		Method:    reqData.Method,
		Path:      reqData.Path,
		Query:     reqData.Query,
		Headers:   reqData.Headers,
		Body:      body,
		Timestamp: time.Now(),
	}

	// Process through the handler (capture → forward → broadcast).
	c.handler(captured)

	// Build and send the response back to the relay.
	respData := ResponseData{
		RequestID: reqData.RequestID,
	}

	if captured.Response != nil {
		respData.StatusCode = captured.Response.StatusCode
		respData.Headers = captured.Response.Headers

		if len(captured.Response.Body) > 0 {
			respData.Body = base64.StdEncoding.EncodeToString(captured.Response.Body)
		}
	} else {
		// No response from local server — return 502.
		respData.StatusCode = 502
		respData.Headers = http.Header{
			"Content-Type":      {"application/json"},
			"X-Tunnl-Error": {"no response from local server"},
		}
	}

	c.mu.Lock()
	err = websocket.JSON.Send(c.conn, Message{
		Type: TypeResponse,
		Data: respData,
	})
	c.mu.Unlock()

	if err != nil {
		log.Error().Err(err).Str("requestId", reqData.RequestID).Msg("failed to send response")
	}
}

// keepalive sends periodic ping messages to keep the connection alive.
func (c *Client) keepalive() {
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-c.stopCh:
			return
		case <-ticker.C:
			c.mu.Lock()
			if c.conn != nil && c.connected {
				err := websocket.JSON.Send(c.conn, Message{Type: TypePing})
				if err != nil {
					log.Debug().Err(err).Msg("keepalive ping failed")
				}
			}
			c.mu.Unlock()
		}
	}
}

// Stop signals the client to disconnect.
func (c *Client) Stop() {
	close(c.stopCh)
	c.mu.Lock()
	defer c.mu.Unlock()
	if c.conn != nil {
		c.conn.Close()
	}
	c.connected = false
}

// IsConnected returns whether the tunnel is currently connected.
func (c *Client) IsConnected() bool {
	c.mu.Lock()
	defer c.mu.Unlock()
	return c.connected
}

// PublicURL returns the public tunnel URL.
func (c *Client) PublicURL() string {
	c.mu.Lock()
	defer c.mu.Unlock()
	return c.publicURL
}

// ExtractSubdomain extracts the subdomain from a public URL like "https://abc123.usetunnl.com".
func ExtractSubdomain(publicURL string) string {
	// Strip protocol.
	host := publicURL
	if idx := strings.Index(host, "://"); idx != -1 {
		host = host[idx+3:]
	}
	// Strip port and path.
	if idx := strings.Index(host, "/"); idx != -1 {
		host = host[:idx]
	}
	if idx := strings.Index(host, ":"); idx != -1 {
		host = host[:idx]
	}
	// Extract first label.
	if idx := strings.Index(host, "."); idx != -1 {
		return host[:idx]
	}
	return ""
}
