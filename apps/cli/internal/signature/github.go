package signature

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"strings"
)

// GitHubVerifier verifies GitHub webhook signatures using the X-Hub-Signature-256 header.
//
// GitHub signs webhooks using HMAC-SHA256. The header format is: sha256=<hex_digest>
type GitHubVerifier struct{}

func (g *GitHubVerifier) Name() string            { return "github" }
func (g *GitHubVerifier) SignatureHeader() string  { return "X-Hub-Signature-256" }

// Verify validates a GitHub webhook signature.
// The secret should be the GitHub webhook secret configured in the repository settings.
func (g *GitHubVerifier) Verify(body []byte, signatureHeader string, secret string) *Result {
	result := &Result{
		Provider: g.Name(),
		Header:   g.SignatureHeader(),
		Value:    signatureHeader,
	}

	if signatureHeader == "" {
		result.Error = "X-Hub-Signature-256 header is missing"
		return result
	}

	// Parse "sha256=<hex>" format.
	if !strings.HasPrefix(signatureHeader, "sha256=") {
		result.Error = "signature header does not start with 'sha256='"
		return result
	}

	receivedSig := strings.TrimPrefix(signatureHeader, "sha256=")

	// Compute expected HMAC-SHA256.
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write(body)
	expectedSig := hex.EncodeToString(mac.Sum(nil))

	if hmac.Equal([]byte(receivedSig), []byte(expectedSig)) {
		result.Valid = true
	} else {
		result.Error = "signature mismatch"
	}

	return result
}
