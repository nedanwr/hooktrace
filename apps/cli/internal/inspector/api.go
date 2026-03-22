package inspector

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"github.com/nedanwr/hooktrace/apps/cli/internal/store"
)

// API provides REST API handlers for the inspector.
type API struct {
	store store.Store
}

// NewAPI creates a new inspector API with the given store.
func NewAPI(s store.Store) *API {
	return &API{store: s}
}

// RegisterRoutes registers API routes on the given mux.
func (a *API) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("GET /api/requests", a.handleListRequests)
	mux.HandleFunc("GET /api/requests/{id}", a.handleGetRequest)
	mux.HandleFunc("DELETE /api/requests", a.handleClearRequests)
	mux.HandleFunc("GET /api/status", a.handleStatus)
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

func writeJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}
