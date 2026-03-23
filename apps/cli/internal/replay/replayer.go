// Package replay provides the ability to replay captured requests with
// modifications and send mock webhook requests to the local dev server.
package replay

import (
	"bytes"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/nedanwr/hooktrace/apps/cli/internal/store"
	"github.com/rs/zerolog/log"
)

// BroadcastFunc is called after a replayed or mock request is stored.
type BroadcastFunc func(req *store.CapturedRequest)

// Replayer sends captured or mock requests to the local dev server and stores
// the result as a new captured request.
type Replayer struct {
	targetURL string
	store     store.Store
	broadcast BroadcastFunc
	client    *http.Client
}

// New creates a Replayer that forwards to the given target URL.
func New(targetURL string, s store.Store, broadcast BroadcastFunc) *Replayer {
	return &Replayer{
		targetURL: targetURL,
		store:     s,
		broadcast: broadcast,
		client: &http.Client{
			Timeout: 30 * time.Second,
			CheckRedirect: func(req *http.Request, via []*http.Request) error {
				return http.ErrUseLastResponse
			},
		},
	}
}

// ReplayOptions contains optional modifications to apply when replaying a request.
type ReplayOptions struct {
	Headers http.Header `json:"headers,omitempty"`
	Body    []byte      `json:"body,omitempty"`
}

// Replay re-sends a previously captured request (by ID) to the local dev server,
// optionally applying header and body modifications. The result is stored as a
// new captured request and broadcast to inspector clients.
func (r *Replayer) Replay(id string, opts *ReplayOptions) (*store.CapturedRequest, error) {
	original := r.store.Get(id)
	if original == nil {
		return nil, fmt.Errorf("request %s not found", id)
	}

	// Clone the original request.
	replayed := &store.CapturedRequest{
		ID:        generateID(),
		Method:    original.Method,
		Path:      original.Path,
		Query:     original.Query,
		Headers:   cloneHeaders(original.Headers),
		Body:      cloneBytes(original.Body),
		Timestamp: time.Now(),
	}

	// Apply modifications if provided.
	if opts != nil {
		if opts.Headers != nil {
			replayed.Headers = opts.Headers
		}
		if opts.Body != nil {
			replayed.Body = opts.Body
		}
	}

	// Send to the local dev server.
	if err := r.send(replayed); err != nil {
		log.Debug().Err(err).Msg("replay forward failed")
	}

	// Store and broadcast.
	r.store.Add(replayed)
	if r.broadcast != nil {
		r.broadcast(replayed)
	}

	return replayed, nil
}

// MockRequest contains the fields needed to create a mock webhook request.
type MockRequest struct {
	Method  string      `json:"method"`
	Path    string      `json:"path"`
	Query   string      `json:"query,omitempty"`
	Headers http.Header `json:"headers,omitempty"`
	Body    []byte      `json:"body,omitempty"`
}

// Mock creates a new request from scratch, sends it to the local dev server,
// stores the result, and broadcasts to inspector clients.
func (r *Replayer) Mock(mock *MockRequest) (*store.CapturedRequest, error) {
	if mock.Method == "" {
		mock.Method = "POST"
	}
	if mock.Path == "" {
		mock.Path = "/"
	}

	captured := &store.CapturedRequest{
		ID:        generateID(),
		Method:    mock.Method,
		Path:      mock.Path,
		Query:     mock.Query,
		Headers:   mock.Headers,
		Body:      mock.Body,
		Timestamp: time.Now(),
	}

	if captured.Headers == nil {
		captured.Headers = make(http.Header)
	}

	// Send to the local dev server.
	if err := r.send(captured); err != nil {
		log.Debug().Err(err).Msg("mock forward failed")
	}

	// Store and broadcast.
	r.store.Add(captured)
	if r.broadcast != nil {
		r.broadcast(captured)
	}

	return captured, nil
}

// send forwards a captured request to the target dev server and populates the response.
func (r *Replayer) send(captured *store.CapturedRequest) error {
	start := time.Now()

	url := fmt.Sprintf("%s%s", r.targetURL, captured.Path)
	if captured.Query != "" {
		url += "?" + captured.Query
	}

	req, err := http.NewRequest(captured.Method, url, bytes.NewReader(captured.Body))
	if err != nil {
		return fmt.Errorf("creating request: %w", err)
	}

	for k, vals := range captured.Headers {
		for _, v := range vals {
			req.Header.Add(k, v)
		}
	}

	resp, err := r.client.Do(req)
	if err != nil {
		captured.Response = &store.CapturedResponse{
			StatusCode: 502,
			Headers:    http.Header{"X-Hooktrace-Error": {"target unreachable"}},
		}
		captured.Duration = time.Since(start)
		return fmt.Errorf("forwarding to %s: %w", r.targetURL, err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("reading response body: %w", err)
	}

	captured.Response = &store.CapturedResponse{
		StatusCode: resp.StatusCode,
		Headers:    resp.Header.Clone(),
		Body:       respBody,
	}
	captured.Duration = time.Since(start)

	return nil
}

func generateID() string {
	b := make([]byte, 8)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}

func cloneHeaders(h http.Header) http.Header {
	if h == nil {
		return make(http.Header)
	}
	return h.Clone()
}

func cloneBytes(b []byte) []byte {
	if b == nil {
		return nil
	}
	c := make([]byte, len(b))
	copy(c, b)
	return c
}
