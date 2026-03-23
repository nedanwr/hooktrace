package tunnel

import (
	"testing"
)

func TestExtractSubdomain(t *testing.T) {
	tests := []struct {
		url      string
		expected string
	}{
		{"https://abc123.hooktrace.dev", "abc123"},
		{"http://myapp.hooktrace.dev", "myapp"},
		{"https://test.hooktrace.dev:8080", "test"},
		{"https://abc123.hooktrace.dev/path", "abc123"},
		{"https://hooktrace.dev", "hooktrace"},
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
