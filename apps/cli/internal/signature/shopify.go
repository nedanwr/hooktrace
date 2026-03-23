package signature

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
)

// ShopifyVerifier verifies Shopify webhook signatures using the X-Shopify-Hmac-Sha256 header.
//
// Shopify signs webhooks using HMAC-SHA256 and base64-encodes the digest.
// The header contains the raw base64-encoded signature.
type ShopifyVerifier struct{}

func (s *ShopifyVerifier) Name() string            { return "shopify" }
func (s *ShopifyVerifier) SignatureHeader() string  { return "X-Shopify-Hmac-Sha256" }

// Verify validates a Shopify webhook signature.
// The secret should be the Shopify app's API secret key.
func (s *ShopifyVerifier) Verify(body []byte, signatureHeader string, secret string) *Result {
	result := &Result{
		Provider: s.Name(),
		Header:   s.SignatureHeader(),
		Value:    signatureHeader,
	}

	if signatureHeader == "" {
		result.Error = "X-Shopify-Hmac-Sha256 header is missing"
		return result
	}

	// Decode the received base64 signature.
	receivedSig, err := base64.StdEncoding.DecodeString(signatureHeader)
	if err != nil {
		result.Error = "invalid base64 in signature header"
		return result
	}

	// Compute expected HMAC-SHA256.
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write(body)
	expectedSig := mac.Sum(nil)

	if hmac.Equal(receivedSig, expectedSig) {
		result.Valid = true
	} else {
		result.Error = "signature mismatch"
	}

	return result
}
