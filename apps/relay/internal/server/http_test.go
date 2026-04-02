package server

import (
	"testing"

	"github.com/nedanwr/tunnl/apps/relay/internal/tunnel"
)

func TestExtractSubdomain(t *testing.T) {
	s := New("8080", "usetunnl.com", tunnel.NewManager())

	tests := []struct {
		host     string
		expected string
	}{
		{"abc123.usetunnl.com", "abc123"},
		{"abc123.usetunnl.com:8080", "abc123"},
		{"usetunnl.com", ""},
		{"usetunnl.com:8080", ""},
		{"www.usetunnl.com", "www"},
		{"sub.sub.usetunnl.com", ""}, // Nested subdomains not allowed.
		{"other.com", ""},
		{"", ""},
	}

	for _, tt := range tests {
		got := s.extractSubdomain(tt.host)
		if got != tt.expected {
			t.Errorf("extractSubdomain(%q) = %q, want %q", tt.host, got, tt.expected)
		}
	}
}
