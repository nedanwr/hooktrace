package server

import (
	"testing"

	"github.com/nedanwr/hooktrace/apps/relay/internal/tunnel"
)

func TestExtractSubdomain(t *testing.T) {
	s := New("8080", "hooktrace.dev", tunnel.NewManager())

	tests := []struct {
		host     string
		expected string
	}{
		{"abc123.hooktrace.dev", "abc123"},
		{"abc123.hooktrace.dev:8080", "abc123"},
		{"hooktrace.dev", ""},
		{"hooktrace.dev:8080", ""},
		{"www.hooktrace.dev", "www"},
		{"sub.sub.hooktrace.dev", ""}, // Nested subdomains not allowed.
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
