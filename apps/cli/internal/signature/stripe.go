package signature

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"strconv"
	"strings"
	"time"
)

// StripeVerifier verifies Stripe webhook signatures using the Stripe-Signature header.
//
// Stripe signs webhooks using HMAC-SHA256 with a "whsec_" prefixed secret.
// The signature header format is: t=<timestamp>,v1=<signature>[,v0=<legacy>]
type StripeVerifier struct{}

func (s *StripeVerifier) Name() string            { return "stripe" }
func (s *StripeVerifier) SignatureHeader() string  { return "Stripe-Signature" }

// Verify validates a Stripe webhook signature.
// The secret should be the Stripe webhook signing secret (e.g., "whsec_...").
func (s *StripeVerifier) Verify(body []byte, signatureHeader string, secret string) *Result {
	result := &Result{
		Provider: s.Name(),
		Header:   s.SignatureHeader(),
		Value:    signatureHeader,
	}

	if signatureHeader == "" {
		result.Error = "Stripe-Signature header is missing"
		return result
	}

	// Parse the signature header: t=timestamp,v1=signature
	parts := strings.Split(signatureHeader, ",")
	var timestamp string
	var signatures []string

	for _, part := range parts {
		kv := strings.SplitN(strings.TrimSpace(part), "=", 2)
		if len(kv) != 2 {
			continue
		}
		switch kv[0] {
		case "t":
			timestamp = kv[1]
		case "v1":
			signatures = append(signatures, kv[1])
		}
	}

	if timestamp == "" {
		result.Error = "missing timestamp in Stripe-Signature header"
		return result
	}

	if len(signatures) == 0 {
		result.Error = "missing v1 signature in Stripe-Signature header"
		return result
	}

	// Validate the timestamp is not too old (tolerance: 5 minutes for verification purposes).
	ts, err := strconv.ParseInt(timestamp, 10, 64)
	if err != nil {
		result.Error = fmt.Sprintf("invalid timestamp: %s", timestamp)
		return result
	}

	age := time.Since(time.Unix(ts, 0))
	if age > 5*time.Minute {
		// Still verify the signature but note the age.
		result.Error = fmt.Sprintf("signature timestamp is %s old (may have expired)", age.Round(time.Second))
	}

	// Compute expected signature: HMAC-SHA256(secret, timestamp + "." + body)
	signedPayload := fmt.Sprintf("%s.%s", timestamp, string(body))
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(signedPayload))
	expectedSig := hex.EncodeToString(mac.Sum(nil))

	// Check if any v1 signature matches.
	for _, sig := range signatures {
		if hmac.Equal([]byte(sig), []byte(expectedSig)) {
			result.Valid = true
			if result.Error != "" {
				// Signature is valid but expired — keep the age warning.
				result.Error = "signature is valid but " + result.Error
			}
			return result
		}
	}

	if result.Error == "" {
		result.Error = "signature mismatch"
	}
	return result
}
