package tunnel

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"strings"
	"sync"

	"github.com/gorilla/websocket"
	"github.com/rs/zerolog/log"
)

// Tunnel represents an active tunnel from a CLI client.
type Tunnel struct {
	ID        string
	Subdomain string
	ClientID  string
	Conn      *websocket.Conn

	// pendingRequests tracks in-flight requests waiting for responses.
	mu               sync.Mutex
	pendingRequests  map[string]chan *ResponseData
}

// newTunnel creates a new tunnel.
func newTunnel(id, subdomain, clientID string, conn *websocket.Conn) *Tunnel {
	return &Tunnel{
		ID:              id,
		Subdomain:       subdomain,
		ClientID:        clientID,
		Conn:            conn,
		pendingRequests: make(map[string]chan *ResponseData),
	}
}

// AddPending registers a pending request and returns a channel to wait on.
func (t *Tunnel) AddPending(requestID string) chan *ResponseData {
	ch := make(chan *ResponseData, 1)
	t.mu.Lock()
	t.pendingRequests[requestID] = ch
	t.mu.Unlock()
	return ch
}

// ResolvePending delivers a response to a waiting request handler.
func (t *Tunnel) ResolvePending(requestID string, resp *ResponseData) {
	t.mu.Lock()
	ch, ok := t.pendingRequests[requestID]
	if ok {
		delete(t.pendingRequests, requestID)
	}
	t.mu.Unlock()

	if ok {
		ch <- resp
	}
}

// ClearPending closes all pending request channels (called on disconnect).
func (t *Tunnel) ClearPending() {
	t.mu.Lock()
	defer t.mu.Unlock()
	for id, ch := range t.pendingRequests {
		close(ch)
		delete(t.pendingRequests, id)
	}
}

// Manager manages the mapping between subdomains and active tunnels.
type Manager struct {
	mu sync.RWMutex

	// subdomains maps subdomain → tunnel
	subdomains map[string]*Tunnel

	// clientTunnels maps clientID → set of tunnel IDs (for enforcing limits)
	clientTunnels map[string]map[string]struct{}

	// maxTunnelsPerClient is the free-tier limit.
	maxTunnelsPerClient int
}

// NewManager creates a new tunnel manager.
func NewManager() *Manager {
	return &Manager{
		subdomains:          make(map[string]*Tunnel),
		clientTunnels:       make(map[string]map[string]struct{}),
		maxTunnelsPerClient: 1, // Free tier: 1 tunnel
	}
}

// Register creates a new tunnel for the given client. If requestedSubdomain is
// empty, a random subdomain is generated. Returns the tunnel or an error.
func (m *Manager) Register(clientID string, requestedSubdomain string, conn *websocket.Conn) (*Tunnel, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	// Determine subdomain.
	subdomain := requestedSubdomain
	if subdomain == "" {
		subdomain = generateSubdomain()
	} else {
		subdomain = sanitizeSubdomain(subdomain)
	}

	// Check if subdomain is already taken by a different client.
	if existing, ok := m.subdomains[subdomain]; ok {
		if existing.ClientID != clientID {
			return nil, fmt.Errorf("subdomain %q is already in use", subdomain)
		}
		// Same client reconnecting — remove old tunnel first.
		m.removeTunnelLocked(existing)
	}

	// Enforce free-tier tunnel limit (after handling reconnects so replacement works).
	if tunnels, ok := m.clientTunnels[clientID]; ok {
		if len(tunnels) >= m.maxTunnelsPerClient {
			return nil, fmt.Errorf("tunnel limit reached: free tier allows %d tunnel(s)", m.maxTunnelsPerClient)
		}
	}

	// Create tunnel.
	tunnelID := generateTunnelID()
	t := newTunnel(tunnelID, subdomain, clientID, conn)

	m.subdomains[subdomain] = t

	if m.clientTunnels[clientID] == nil {
		m.clientTunnels[clientID] = make(map[string]struct{})
	}
	m.clientTunnels[clientID][tunnelID] = struct{}{}

	log.Info().
		Str("tunnelId", tunnelID).
		Str("subdomain", subdomain).
		Str("clientId", clientID).
		Msg("tunnel registered")

	return t, nil
}

// Lookup returns the tunnel for the given subdomain, or nil if not found.
func (m *Manager) Lookup(subdomain string) *Tunnel {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return m.subdomains[subdomain]
}

// Remove removes a tunnel and cleans up all state.
func (m *Manager) Remove(t *Tunnel) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.removeTunnelLocked(t)
}

func (m *Manager) removeTunnelLocked(t *Tunnel) {
	delete(m.subdomains, t.Subdomain)

	if tunnels, ok := m.clientTunnels[t.ClientID]; ok {
		delete(tunnels, t.ID)
		if len(tunnels) == 0 {
			delete(m.clientTunnels, t.ClientID)
		}
	}

	t.ClearPending()

	log.Info().
		Str("tunnelId", t.ID).
		Str("subdomain", t.Subdomain).
		Msg("tunnel removed")
}

// ActiveCount returns the total number of active tunnels.
func (m *Manager) ActiveCount() int {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return len(m.subdomains)
}

func generateSubdomain() string {
	b := make([]byte, 4)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}

func generateTunnelID() string {
	b := make([]byte, 8)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}

func sanitizeSubdomain(s string) string {
	s = strings.ToLower(s)
	// Only allow alphanumeric and hyphens.
	var result []byte
	for i := 0; i < len(s); i++ {
		c := s[i]
		if (c >= 'a' && c <= 'z') || (c >= '0' && c <= '9') || c == '-' {
			result = append(result, c)
		}
	}
	if len(result) == 0 {
		return generateSubdomain()
	}
	return string(result)
}
