// Package signature provides webhook signature verification for multiple
// providers (Stripe, GitHub, Shopify) and a generic HMAC verifier.
package signature

import "fmt"

// Result holds the outcome of a signature verification.
type Result struct {
	Valid    bool   `json:"valid"`
	Provider string `json:"provider"`
	Error    string `json:"error,omitempty"`
	Header   string `json:"header"`   // Which header was used for verification
	Value    string `json:"value"`    // The signature value found
}

// Verifier is the interface all provider-specific signature verifiers implement.
type Verifier interface {
	// Name returns the provider identifier (e.g. "stripe", "github").
	Name() string
	// SignatureHeader returns the HTTP header name that carries the signature.
	SignatureHeader() string
	// Verify checks the webhook signature given the raw body, the signature
	// header value, and the signing secret.
	Verify(body []byte, signatureHeader string, secret string) *Result
}

// Providers returns all built-in signature verifiers.
func Providers() []Verifier {
	return []Verifier{
		&StripeVerifier{},
		&GitHubVerifier{},
		&ShopifyVerifier{},
		&HMACVerifier{Algorithm: "sha256"},
	}
}

// ProviderNames returns the names of all built-in providers.
func ProviderNames() []string {
	providers := Providers()
	names := make([]string, len(providers))
	for i, p := range providers {
		names[i] = p.Name()
	}
	return names
}

// GetProvider returns the verifier for the given provider name, or an error.
func GetProvider(name string) (Verifier, error) {
	for _, p := range Providers() {
		if p.Name() == name {
			return p, nil
		}
	}
	return nil, fmt.Errorf("unknown signature provider: %s", name)
}
