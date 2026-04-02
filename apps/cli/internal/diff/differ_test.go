package diff

import (
	"net/http"
	"testing"
	"time"

	"github.com/nedanwr/tunnl/apps/cli/internal/store"
)

func TestDiff_IdenticalRequests(t *testing.T) {
	req := &store.CapturedRequest{
		ID:        "abc123",
		Method:    "POST",
		Path:      "/webhook",
		Headers:   http.Header{"Content-Type": {"application/json"}},
		Body:      []byte(`{"event":"test"}`),
		Timestamp: time.Now(),
	}

	result := Diff(req, req)
	if result.Summary.TotalChanges != 0 {
		t.Errorf("expected 0 changes for identical requests, got %d", result.Summary.TotalChanges)
	}
}

func TestDiff_DifferentMethods(t *testing.T) {
	left := &store.CapturedRequest{
		ID: "a", Method: "POST", Path: "/webhook", Timestamp: time.Now(),
		Headers: http.Header{},
	}
	right := &store.CapturedRequest{
		ID: "b", Method: "PUT", Path: "/webhook", Timestamp: time.Now(),
		Headers: http.Header{},
	}

	result := Diff(left, right)
	if result.Summary.TotalChanges != 1 {
		t.Fatalf("expected 1 change, got %d", result.Summary.TotalChanges)
	}
	if result.Changes[0].Section != "method" {
		t.Errorf("expected method change, got %s", result.Changes[0].Section)
	}
	if result.Changes[0].Left != "POST" || result.Changes[0].Right != "PUT" {
		t.Errorf("unexpected change values: %+v", result.Changes[0])
	}
}

func TestDiff_HeaderChanges(t *testing.T) {
	left := &store.CapturedRequest{
		ID: "a", Method: "POST", Path: "/webhook", Timestamp: time.Now(),
		Headers: http.Header{
			"Content-Type":  {"application/json"},
			"X-Old-Header":  {"old"},
		},
	}
	right := &store.CapturedRequest{
		ID: "b", Method: "POST", Path: "/webhook", Timestamp: time.Now(),
		Headers: http.Header{
			"Content-Type":  {"text/plain"},
			"X-New-Header":  {"new"},
		},
	}

	result := Diff(left, right)

	// Expect: Content-Type modified, X-Old-Header removed, X-New-Header added = 3 changes.
	if result.Summary.TotalChanges != 3 {
		t.Fatalf("expected 3 changes, got %d: %+v", result.Summary.TotalChanges, result.Changes)
	}
	if result.Summary.Modified != 1 || result.Summary.Added != 1 || result.Summary.Removed != 1 {
		t.Errorf("unexpected summary: %+v", result.Summary)
	}
}

func TestDiff_BodyChanges(t *testing.T) {
	left := &store.CapturedRequest{
		ID: "a", Method: "POST", Path: "/webhook", Timestamp: time.Now(),
		Headers: http.Header{},
		Body:    []byte(`{"event":"created"}`),
	}
	right := &store.CapturedRequest{
		ID: "b", Method: "POST", Path: "/webhook", Timestamp: time.Now(),
		Headers: http.Header{},
		Body:    []byte(`{"event":"updated"}`),
	}

	result := Diff(left, right)
	found := false
	for _, c := range result.Changes {
		if c.Section == "body" {
			found = true
			if c.Type != "modified" {
				t.Errorf("expected body modified, got %s", c.Type)
			}
		}
	}
	if !found {
		t.Error("expected body change but found none")
	}
}

func TestDiff_ResponseDifferences(t *testing.T) {
	left := &store.CapturedRequest{
		ID: "a", Method: "POST", Path: "/webhook", Timestamp: time.Now(),
		Headers: http.Header{},
		Response: &store.CapturedResponse{
			StatusCode: 200,
			Headers:    http.Header{"X-Request-Id": {"abc"}},
			Body:       []byte("ok"),
		},
	}
	right := &store.CapturedRequest{
		ID: "b", Method: "POST", Path: "/webhook", Timestamp: time.Now(),
		Headers: http.Header{},
		Response: &store.CapturedResponse{
			StatusCode: 500,
			Headers:    http.Header{"X-Request-Id": {"def"}},
			Body:       []byte("error"),
		},
	}

	result := Diff(left, right)
	if result.Summary.TotalChanges < 3 {
		t.Errorf("expected at least 3 changes (status, header, body), got %d", result.Summary.TotalChanges)
	}
}

func TestDiff_MissingResponse(t *testing.T) {
	left := &store.CapturedRequest{
		ID: "a", Method: "POST", Path: "/webhook", Timestamp: time.Now(),
		Headers: http.Header{},
		Response: &store.CapturedResponse{StatusCode: 200, Headers: http.Header{}},
	}
	right := &store.CapturedRequest{
		ID: "b", Method: "POST", Path: "/webhook", Timestamp: time.Now(),
		Headers: http.Header{},
	}

	result := Diff(left, right)
	found := false
	for _, c := range result.Changes {
		if c.Section == "status" && c.Type == "removed" {
			found = true
		}
	}
	if !found {
		t.Error("expected response removed change")
	}
}
