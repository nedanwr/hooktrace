// Package store defines the storage interface and types for captured webhook requests.
package store

import (
	"net/http"
	"time"
)

// CapturedRequest holds the full details of an intercepted webhook request and
// the response returned by the local dev server.
type CapturedRequest struct {
	ID        string            `json:"id"`
	Method    string            `json:"method"`
	Path      string            `json:"path"`
	Query     string            `json:"query,omitempty"`
	Headers   http.Header       `json:"headers"`
	Body      []byte            `json:"body,omitempty"`
	Timestamp time.Time         `json:"timestamp"`
	Response  *CapturedResponse `json:"response,omitempty"`
	Duration  time.Duration     `json:"duration"`
}

// CapturedResponse holds the HTTP response returned by the local dev server.
type CapturedResponse struct {
	StatusCode int         `json:"statusCode"`
	Headers    http.Header `json:"headers"`
	Body       []byte      `json:"body,omitempty"`
}

// Store is the interface for persisting captured requests.
type Store interface {
	// Add stores a captured request. Implementations may evict old entries.
	Add(req *CapturedRequest)
	// Get returns a single request by ID, or nil if not found.
	Get(id string) *CapturedRequest
	// List returns the most recent requests, newest first, up to limit.
	List(limit int) []*CapturedRequest
	// Clear removes all stored requests.
	Clear()
	// Count returns the number of stored requests.
	Count() int
}
