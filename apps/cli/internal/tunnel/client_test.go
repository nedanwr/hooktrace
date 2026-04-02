package tunnel

import (
	"testing"
)

func TestExtractSubdomain(t *testing.T) {
	tests := []struct {
		url      string
		expected string
	}{
		{"https://abc123.usetunnl.com", "abc123"},
		{"http://myapp.usetunnl.com", "myapp"},
		{"https://test.usetunnl.com:8080", "test"},
		{"https://abc123.usetunnl.com/path", "abc123"},
		{"https://usetunnl.com", "usetunnl"},
		{"localhost", ""},
		{"", ""},
	}

	for _, tt := range tests {
		got := ExtractSubdomain(tt.url)
		if got != tt.expected {
			t.Errorf("ExtractSubdomain(%q) = %q, want %q", tt.url, got, tt.expected)
		}
	}
}
