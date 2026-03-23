package tunnel

import (
	"testing"

	"github.com/gorilla/websocket"
)

func TestManager_Register(t *testing.T) {
	mgr := NewManager()

	// Mock WebSocket connection — we only need it for identity, not actual I/O.
	var conn websocket.Conn

	tun, err := mgr.Register("client1", "", &conn)
	if err != nil {
		t.Fatalf("Register failed: %v", err)
	}

	if tun.ClientID != "client1" {
		t.Errorf("expected clientID 'client1', got %q", tun.ClientID)
	}

	if tun.Subdomain == "" {
		t.Error("expected non-empty subdomain")
	}

	if mgr.ActiveCount() != 1 {
		t.Errorf("expected 1 active tunnel, got %d", mgr.ActiveCount())
	}
}

func TestManager_FreeTierLimit(t *testing.T) {
	mgr := NewManager()

	var conn1, conn2 websocket.Conn

	_, err := mgr.Register("client1", "test1", &conn1)
	if err != nil {
		t.Fatalf("first register failed: %v", err)
	}

	// Second tunnel for the same client should fail (free tier limit = 1).
	_, err = mgr.Register("client1", "test2", &conn2)
	if err == nil {
		t.Error("expected error for second tunnel on free tier")
	}
}

func TestManager_DifferentClients(t *testing.T) {
	mgr := NewManager()

	var conn1, conn2 websocket.Conn

	_, err := mgr.Register("client1", "sub1", &conn1)
	if err != nil {
		t.Fatalf("first register failed: %v", err)
	}

	// Different client should be allowed.
	_, err = mgr.Register("client2", "sub2", &conn2)
	if err != nil {
		t.Fatalf("second register failed: %v", err)
	}

	if mgr.ActiveCount() != 2 {
		t.Errorf("expected 2 active tunnels, got %d", mgr.ActiveCount())
	}
}

func TestManager_Lookup(t *testing.T) {
	mgr := NewManager()
	var conn websocket.Conn

	tun, _ := mgr.Register("client1", "myapp", &conn)

	found := mgr.Lookup("myapp")
	if found == nil {
		t.Fatal("expected to find tunnel")
	}
	if found.ID != tun.ID {
		t.Errorf("expected tunnel ID %q, got %q", tun.ID, found.ID)
	}

	notFound := mgr.Lookup("nonexistent")
	if notFound != nil {
		t.Error("expected nil for nonexistent subdomain")
	}
}

func TestManager_Remove(t *testing.T) {
	mgr := NewManager()
	var conn websocket.Conn

	tun, _ := mgr.Register("client1", "removeme", &conn)
	mgr.Remove(tun)

	if mgr.ActiveCount() != 0 {
		t.Errorf("expected 0 active tunnels after removal, got %d", mgr.ActiveCount())
	}

	if mgr.Lookup("removeme") != nil {
		t.Error("expected nil lookup after removal")
	}
}

func TestManager_SameClientReconnect(t *testing.T) {
	mgr := NewManager()
	var conn1, conn2 websocket.Conn

	// Client connects with a subdomain.
	_, err := mgr.Register("client1", "stable", &conn1)
	if err != nil {
		t.Fatalf("first register failed: %v", err)
	}

	// Same client reconnects with the same subdomain — should replace old tunnel.
	tun2, err := mgr.Register("client1", "stable", &conn2)
	if err != nil {
		t.Fatalf("reconnect failed: %v", err)
	}

	if mgr.ActiveCount() != 1 {
		t.Errorf("expected 1 active tunnel after reconnect, got %d", mgr.ActiveCount())
	}

	found := mgr.Lookup("stable")
	if found.ID != tun2.ID {
		t.Error("expected lookup to return new tunnel")
	}
}

func TestManager_SubdomainConflict(t *testing.T) {
	mgr := NewManager()
	var conn1, conn2 websocket.Conn

	_, err := mgr.Register("client1", "taken", &conn1)
	if err != nil {
		t.Fatalf("first register failed: %v", err)
	}

	// Different client trying same subdomain should fail.
	_, err = mgr.Register("client2", "taken", &conn2)
	if err == nil {
		t.Error("expected error for subdomain conflict")
	}
}

func TestSanitizeSubdomain(t *testing.T) {
	tests := []struct {
		input    string
		expected string
	}{
		{"myapp", "myapp"},
		{"MY-APP", "my-app"},
		{"my_app!", "myapp"},
		{"my.app", "myapp"},
		{"hello-world-123", "hello-world-123"},
	}

	for _, tt := range tests {
		got := sanitizeSubdomain(tt.input)
		if got != tt.expected {
			t.Errorf("sanitizeSubdomain(%q) = %q, want %q", tt.input, got, tt.expected)
		}
	}
}
