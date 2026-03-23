package inspector

import (
	"encoding/base64"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"github.com/nedanwr/hooktrace/apps/cli/internal/diff"
	"github.com/nedanwr/hooktrace/apps/cli/internal/replay"
	"github.com/nedanwr/hooktrace/apps/cli/internal/signature"
	"github.com/nedanwr/hooktrace/apps/cli/internal/store"
)

// API provides REST API handlers for the inspector.
type API struct {
	store    store.Store
	replayer *replay.Replayer
}

// NewAPI creates a new inspector API with the given store.
func NewAPI(s store.Store) *API {
	return &API{store: s}
}

// SetReplayer sets the replayer used for replay and mock endpoints.
func (a *API) SetReplayer(r *replay.Replayer) {
	a.replayer = r
}

// RegisterRoutes registers API routes on the given mux.
func (a *API) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("GET /api/requests", a.handleListRequests)
	mux.HandleFunc("GET /api/requests/{id}", a.handleGetRequest)
	mux.HandleFunc("POST /api/requests/{id}/replay", a.handleReplay)
	mux.HandleFunc("POST /api/mock", a.handleMock)
	mux.HandleFunc("DELETE /api/requests", a.handleClearRequests)
	mux.HandleFunc("GET /api/status", a.handleStatus)
	mux.HandleFunc("GET /api/diff", a.handleDiff)
	mux.HandleFunc("GET /api/requests/{id}/verify-signature", a.handleVerifySignature)
	mux.HandleFunc("GET /api/signature/providers", a.handleSignatureProviders)
}

// handleListRequests returns the list of captured requests.
// Supports query params: ?limit=50&q=search&status=success
func (a *API) handleListRequests(w http.ResponseWriter, r *http.Request) {
	limit := 50
	if l := r.URL.Query().Get("limit"); l != "" {
		if n, err := strconv.Atoi(l); err == nil && n > 0 {
			limit = n
		}
	}

	requests := a.store.List(limit)

	// Apply search filter if provided.
	if q := r.URL.Query().Get("q"); q != "" {
		q = strings.ToLower(q)
		filtered := make([]*store.CapturedRequest, 0)
		for _, req := range requests {
			if strings.Contains(strings.ToLower(req.Path), q) ||
				strings.Contains(strings.ToLower(req.Method), q) {
				filtered = append(filtered, req)
			}
		}
		requests = filtered
	}

	// Apply status filter if provided.
	if status := r.URL.Query().Get("status"); status != "" {
		filtered := make([]*store.CapturedRequest, 0)
		for _, req := range requests {
			if req.Response == nil {
				continue
			}
			code := req.Response.StatusCode
			match := false
			switch status {
			case "success":
				match = code >= 200 && code < 300
			case "redirect":
				match = code >= 300 && code < 400
			case "client_error":
				match = code >= 400 && code < 500
			case "server_error":
				match = code >= 500
			case "error":
				match = code >= 400
			}
			if match {
				filtered = append(filtered, req)
			}
		}
		requests = filtered
	}

	writeJSON(w, http.StatusOK, requests)
}

// handleGetRequest returns a single captured request by ID.
func (a *API) handleGetRequest(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	req := a.store.Get(id)
	if req == nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "request not found"})
		return
	}
	writeJSON(w, http.StatusOK, req)
}

// replayPayload is the JSON body for a replay request.
type replayPayload struct {
	Headers map[string][]string `json:"headers,omitempty"`
	Body    string              `json:"body,omitempty"` // base64-encoded
}

// handleReplay replays an existing captured request with optional modifications.
func (a *API) handleReplay(w http.ResponseWriter, r *http.Request) {
	if a.replayer == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]string{"error": "replayer not configured"})
		return
	}

	id := r.PathValue("id")

	var payload replayPayload
	if r.Body != nil {
		defer r.Body.Close()
		json.NewDecoder(r.Body).Decode(&payload)
	}

	var opts *replay.ReplayOptions
	if payload.Headers != nil || payload.Body != "" {
		opts = &replay.ReplayOptions{}
		if payload.Headers != nil {
			opts.Headers = http.Header(payload.Headers)
		}
		if payload.Body != "" {
			decoded, err := base64.StdEncoding.DecodeString(payload.Body)
			if err != nil {
				writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid base64 body"})
				return
			}
			opts.Body = decoded
		}
	}

	result, err := a.replayer.Replay(id, opts)
	if err != nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": err.Error()})
		return
	}

	writeJSON(w, http.StatusOK, result)
}

// mockPayload is the JSON body for a mock request.
type mockPayload struct {
	Method  string              `json:"method"`
	Path    string              `json:"path"`
	Query   string              `json:"query,omitempty"`
	Headers map[string][]string `json:"headers,omitempty"`
	Body    string              `json:"body,omitempty"` // base64-encoded
}

// handleMock sends a new mock webhook to the local dev server.
func (a *API) handleMock(w http.ResponseWriter, r *http.Request) {
	if a.replayer == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]string{"error": "replayer not configured"})
		return
	}

	var payload mockPayload
	if r.Body != nil {
		defer r.Body.Close()
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid JSON body"})
			return
		}
	}

	var body []byte
	if payload.Body != "" {
		decoded, err := base64.StdEncoding.DecodeString(payload.Body)
		if err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid base64 body"})
			return
		}
		body = decoded
	}

	mock := &replay.MockRequest{
		Method:  payload.Method,
		Path:    payload.Path,
		Query:   payload.Query,
		Headers: http.Header(payload.Headers),
		Body:    body,
	}

	result, err := a.replayer.Mock(mock)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	writeJSON(w, http.StatusOK, result)
}

// handleClearRequests clears all captured requests.
func (a *API) handleClearRequests(w http.ResponseWriter, r *http.Request) {
	a.store.Clear()
	writeJSON(w, http.StatusOK, map[string]string{"status": "cleared"})
}

// handleStatus returns the current status of the inspector.
func (a *API) handleStatus(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]interface{}{
		"requestCount": a.store.Count(),
	})
}

// handleDiff compares two captured requests and returns a structured diff.
// Query params: ?left=<id>&right=<id>
func (a *API) handleDiff(w http.ResponseWriter, r *http.Request) {
	leftID := r.URL.Query().Get("left")
	rightID := r.URL.Query().Get("right")

	if leftID == "" || rightID == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "both 'left' and 'right' query params are required"})
		return
	}

	left := a.store.Get(leftID)
	if left == nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "left request not found"})
		return
	}

	right := a.store.Get(rightID)
	if right == nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "right request not found"})
		return
	}

	result := diff.Diff(left, right)
	writeJSON(w, http.StatusOK, result)
}

// handleVerifySignature verifies the webhook signature for a captured request.
// Query params: ?provider=stripe&secret=whsec_...
func (a *API) handleVerifySignature(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	provider := r.URL.Query().Get("provider")
	secret := r.URL.Query().Get("secret")

	if provider == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "provider query param is required"})
		return
	}
	if secret == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "secret query param is required"})
		return
	}

	req := a.store.Get(id)
	if req == nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "request not found"})
		return
	}

	verifier, err := signature.GetProvider(provider)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}

	// Extract the signature header value from the captured request.
	sigHeader := verifier.SignatureHeader()
	sigValue := ""
	if vals := req.Headers[sigHeader]; len(vals) > 0 {
		sigValue = vals[0]
	}
	// Also check case-insensitive for common variations.
	if sigValue == "" {
		for k, vals := range req.Headers {
			if strings.EqualFold(k, sigHeader) && len(vals) > 0 {
				sigValue = vals[0]
				break
			}
		}
	}

	result := verifier.Verify(req.Body, sigValue, secret)
	writeJSON(w, http.StatusOK, result)
}

// handleSignatureProviders returns the list of available signature verification providers.
func (a *API) handleSignatureProviders(w http.ResponseWriter, r *http.Request) {
	type providerInfo struct {
		Name   string `json:"name"`
		Header string `json:"header"`
	}

	providers := signature.Providers()
	info := make([]providerInfo, len(providers))
	for i, p := range providers {
		info[i] = providerInfo{
			Name:   p.Name(),
			Header: p.SignatureHeader(),
		}
	}
	writeJSON(w, http.StatusOK, info)
}

func writeJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}
