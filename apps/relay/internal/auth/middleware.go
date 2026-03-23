// Package auth provides authentication middleware for the relay server.
// In Phase 3 (free tier), this is a placeholder. In Phase 6, it will verify
// Clerk JWTs for paid features.
package auth

import (
	"net/http"
)

// Middleware verifies authentication tokens for paid tier features.
// For free tier, this is a pass-through.
func Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// TODO(phase6): Verify Clerk JWT from Authorization header.
		// For now, allow all connections (free tier).
		next.ServeHTTP(w, r)
	})
}
