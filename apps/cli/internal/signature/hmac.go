package signature

import (
	"crypto/hmac"
	"crypto/sha1"
	"crypto/sha256"
	"crypto/sha512"
	"encoding/hex"
	"fmt"
	"hash"
	"strings"
)

// HMACVerifier provides generic HMAC signature verification for webhooks
// that use a simple HMAC-based signing scheme.
//
// It supports sha1, sha256, and sha512 algorithms. The signature header is
// expected to contain either a raw hex digest or a "sha256=<hex>" prefixed value.
type HMACVerifier struct {
	Algorithm string // "sha1", "sha256", or "sha512" — defaults to "sha256"
}

func (h *HMACVerifier) Name() string            { return "hmac" }
func (h *HMACVerifier) SignatureHeader() string  { return "X-Webhook-Signature" }

// Verify validates a generic HMAC webhook signature.
// The secret is the shared signing key. The signature header value may be
// a raw hex digest or prefixed with the algorithm (e.g., "sha256=<hex>").
func (h *HMACVerifier) Verify(body []byte, signatureHeader string, secret string) *Result {
	result := &Result{
		Provider: h.Name(),
		Header:   h.SignatureHeader(),
		Value:    signatureHeader,
	}

	if signatureHeader == "" {
		result.Error = "signature header is missing"
		return result
	}

	// Determine algorithm and extract the hex signature.
	algorithm := h.Algorithm
	if algorithm == "" {
		algorithm = "sha256"
	}
	hexSig := signatureHeader

	// Handle "algo=hex" prefix format (e.g., "sha256=abc123").
	if idx := strings.Index(signatureHeader, "="); idx > 0 {
		prefix := signatureHeader[:idx]
		switch prefix {
		case "sha1", "sha256", "sha512":
			algorithm = prefix
			hexSig = signatureHeader[idx+1:]
		}
	}

	// Get the hash function.
	hashFunc, err := getHashFunc(algorithm)
	if err != nil {
		result.Error = err.Error()
		return result
	}

	// Compute expected HMAC.
	mac := hmac.New(hashFunc, []byte(secret))
	mac.Write(body)
	expectedSig := hex.EncodeToString(mac.Sum(nil))

	if hmac.Equal([]byte(hexSig), []byte(expectedSig)) {
		result.Valid = true
	} else {
		result.Error = fmt.Sprintf("signature mismatch (algorithm: %s)", algorithm)
	}

	return result
}

func getHashFunc(algorithm string) (func() hash.Hash, error) {
	switch algorithm {
	case "sha1":
		return sha1.New, nil
	case "sha256":
		return sha256.New, nil
	case "sha512":
		return sha512.New, nil
	default:
		return nil, fmt.Errorf("unsupported HMAC algorithm: %s", algorithm)
	}
}
