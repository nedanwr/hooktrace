package server

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net"
	"net/http"
	"strings"
	"testing"
	"time"

	"github.com/gorilla/websocket"
	"github.com/nedanwr/tunnl/apps/relay/internal/tunnel"
)

// TestEndToEndTunnel tests the full tunnel flow:
// 1. Start relay server
// 2. CLI client connects via WebSocket and registers
// 3. External webhook is sent to the tunnel URL
// 4. Relay forwards to CLI, CLI responds, relay returns response
func TestEndToEndTunnel(t *testing.T) {
	// Find a free port.
	listener, err := net.Listen("tcp", ":0")
	if err != nil {
		t.Fatal(err)
	}
	port := listener.Addr().(*net.TCPAddr).Port
	listener.Close()

	mgr := tunnel.NewManager()
	srv := New(fmt.Sprintf("%d", port), "localhost", mgr)

	// Start server in background.
	go func() {
		if err := srv.Start(); err != nil && err != http.ErrServerClosed {
			t.Logf("server error: %v", err)
		}
	}()

	// Wait for server to be ready.
	time.Sleep(100 * time.Millisecond)

	// Connect as a CLI client.
	wsURL := fmt.Sprintf("ws://localhost:%d/_tunnel/ws", port)
	conn, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
	if err != nil {
		t.Fatalf("dial failed: %v", err)
	}
	defer conn.Close()

	// Send TUNNEL_REGISTER.
	regMsg := tunnel.Message{
		Type: tunnel.TypeRegister,
		Data: tunnel.RegisterData{
			ClientID:           "test-client",
			RequestedSubdomain: "testapp",
		},
	}
	if err := conn.WriteJSON(regMsg); err != nil {
		t.Fatalf("write register failed: %v", err)
	}

	// Read TUNNEL_REGISTERED response.
	var resp tunnel.Message
	if err := conn.ReadJSON(&resp); err != nil {
		t.Fatalf("read registered failed: %v", err)
	}

	if resp.Type != tunnel.TypeRegistered {
		t.Fatalf("expected TUNNEL_REGISTERED, got %s", resp.Type)
	}

	respBytes, _ := json.Marshal(resp.Data)
	var regResp tunnel.RegisteredData
	json.Unmarshal(respBytes, &regResp)

	if regResp.Subdomain != "testapp" {
		t.Errorf("expected subdomain 'testapp', got %q", regResp.Subdomain)
	}

	// Start a goroutine to handle incoming tunnel requests.
	go func() {
		for {
			var msg tunnel.Message
			if err := conn.ReadJSON(&msg); err != nil {
				return
			}

			if msg.Type == tunnel.TypeRequest {
				dataBytes, _ := json.Marshal(msg.Data)
				var reqData tunnel.RequestData
				json.Unmarshal(dataBytes, &reqData)

				// Respond with a 200 and echo the body.
				respBody := base64.StdEncoding.EncodeToString([]byte(`{"status":"ok"}`))
				tunnelResp := tunnel.Message{
					Type: tunnel.TypeResponse,
					Data: tunnel.ResponseData{
						RequestID:  reqData.RequestID,
						StatusCode: 200,
						Headers:    http.Header{"Content-Type": {"application/json"}},
						Body:       respBody,
					},
				}
				conn.WriteJSON(tunnelResp)
			}
		}
	}()

	// Send a webhook to the tunnel.
	webhookURL := fmt.Sprintf("http://testapp.localhost:%d/webhook/test", port)
	webhookBody := strings.NewReader(`{"event":"payment.completed","amount":100}`)
	httpResp, err := http.Post(webhookURL, "application/json", webhookBody)
	if err != nil {
		t.Fatalf("webhook POST failed: %v", err)
	}
	defer httpResp.Body.Close()

	if httpResp.StatusCode != 200 {
		t.Errorf("expected 200, got %d", httpResp.StatusCode)
	}

	// Verify active tunnel count.
	if mgr.ActiveCount() != 1 {
		t.Errorf("expected 1 active tunnel, got %d", mgr.ActiveCount())
	}

	// Clean up.
	srv.Shutdown()
}

// TestTunnelNotFound verifies 404 for unknown subdomains.
func TestTunnelNotFound(t *testing.T) {
	listener, err := net.Listen("tcp", ":0")
	if err != nil {
		t.Fatal(err)
	}
	port := listener.Addr().(*net.TCPAddr).Port
	listener.Close()

	mgr := tunnel.NewManager()
	srv := New(fmt.Sprintf("%d", port), "localhost", mgr)

	go func() {
		srv.Start()
	}()
	time.Sleep(100 * time.Millisecond)
	defer srv.Shutdown()

	resp, err := http.Get(fmt.Sprintf("http://nonexistent.localhost:%d/test", port))
	if err != nil {
		t.Fatalf("request failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != 404 {
		t.Errorf("expected 404 for unknown subdomain, got %d", resp.StatusCode)
	}
}

// TestHealthEndpoint verifies the health check.
func TestHealthEndpoint(t *testing.T) {
	listener, err := net.Listen("tcp", ":0")
	if err != nil {
		t.Fatal(err)
	}
	port := listener.Addr().(*net.TCPAddr).Port
	listener.Close()

	mgr := tunnel.NewManager()
	srv := New(fmt.Sprintf("%d", port), "localhost", mgr)

	go func() {
		srv.Start()
	}()
	time.Sleep(100 * time.Millisecond)
	defer srv.Shutdown()

	resp, err := http.Get(fmt.Sprintf("http://localhost:%d/_tunnel/health", port))
	if err != nil {
		t.Fatalf("health check failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		t.Errorf("expected 200, got %d", resp.StatusCode)
	}
}
