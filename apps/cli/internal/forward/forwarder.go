// Package forward proxies captured webhook requests to the user's local dev server.
package forward

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/nedanwr/tunnl/apps/cli/internal/store"
	"github.com/rs/zerolog/log"
)

// Forwarder sends captured requests to a local target server and records the response.
type Forwarder struct {
	targetURL string
	client    *http.Client
}

// New creates a forwarder that sends requests to the given target URL (e.g. "http://localhost:3000").
func New(targetURL string) *Forwarder {
	return &Forwarder{
		targetURL: targetURL,
		client: &http.Client{
			Timeout: 30 * time.Second,
			// Don't follow redirects — return the redirect response as-is.
			CheckRedirect: func(req *http.Request, via []*http.Request) error {
				return http.ErrUseLastResponse
			},
		},
	}
}

// Forward sends the captured request to the target server and populates the
// response fields on the CapturedRequest. Returns an error if the target is unreachable.
func (f *Forwarder) Forward(captured *store.CapturedRequest) error {
	start := time.Now()

	url := fmt.Sprintf("%s%s", f.targetURL, captured.Path)
	if captured.Query != "" {
		url += "?" + captured.Query
	}

	req, err := http.NewRequest(captured.Method, url, bytes.NewReader(captured.Body))
	if err != nil {
		return fmt.Errorf("creating forward request: %w", err)
	}

	// Copy original headers.
	for k, vals := range captured.Headers {
		for _, v := range vals {
			req.Header.Add(k, v)
		}
	}

	resp, err := f.client.Do(req)
	if err != nil {
		log.Warn().Err(err).Str("target", f.targetURL).Msg("forward failed")
		captured.Response = &store.CapturedResponse{
			StatusCode: 502,
			Headers:    http.Header{"X-Tunnl-Error": {"target unreachable"}},
		}
		captured.Duration = time.Since(start)
		return fmt.Errorf("forwarding to %s: %w", f.targetURL, err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("reading forward response body: %w", err)
	}

	captured.Response = &store.CapturedResponse{
		StatusCode: resp.StatusCode,
		Headers:    resp.Header.Clone(),
		Body:       respBody,
	}
	captured.Duration = time.Since(start)

	return nil
}
