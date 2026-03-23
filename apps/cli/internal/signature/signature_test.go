package signature

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"fmt"
	"testing"
	"time"
)

func TestStripeVerifier_ValidSignature(t *testing.T) {
	v := &StripeVerifier{}
	body := []byte(`{"event":"test"}`)
	secret := "whsec_test_secret"
	ts := fmt.Sprintf("%d", time.Now().Unix())

	// Compute valid signature.
	signedPayload := fmt.Sprintf("%s.%s", ts, string(body))
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(signedPayload))
	sig := hex.EncodeToString(mac.Sum(nil))

	header := fmt.Sprintf("t=%s,v1=%s", ts, sig)
	result := v.Verify(body, header, secret)

	if !result.Valid {
		t.Errorf("expected valid signature, got error: %s", result.Error)
	}
}

func TestStripeVerifier_InvalidSignature(t *testing.T) {
	v := &StripeVerifier{}
	body := []byte(`{"event":"test"}`)
	ts := fmt.Sprintf("%d", time.Now().Unix())

	header := fmt.Sprintf("t=%s,v1=invalidsignature", ts)
	result := v.Verify(body, header, "whsec_test_secret")

	if result.Valid {
		t.Error("expected invalid signature")
	}
}

func TestStripeVerifier_MissingHeader(t *testing.T) {
	v := &StripeVerifier{}
	result := v.Verify([]byte("body"), "", "secret")
	if result.Valid {
		t.Error("expected invalid result for missing header")
	}
	if result.Error == "" {
		t.Error("expected error message")
	}
}

func TestGitHubVerifier_ValidSignature(t *testing.T) {
	v := &GitHubVerifier{}
	body := []byte(`{"action":"opened"}`)
	secret := "my_github_secret"

	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write(body)
	sig := "sha256=" + hex.EncodeToString(mac.Sum(nil))

	result := v.Verify(body, sig, secret)
	if !result.Valid {
		t.Errorf("expected valid signature, got error: %s", result.Error)
	}
}

func TestGitHubVerifier_InvalidSignature(t *testing.T) {
	v := &GitHubVerifier{}
	result := v.Verify([]byte("body"), "sha256=invalid", "secret")
	if result.Valid {
		t.Error("expected invalid signature")
	}
}

func TestGitHubVerifier_MissingPrefix(t *testing.T) {
	v := &GitHubVerifier{}
	result := v.Verify([]byte("body"), "noprefixhex", "secret")
	if result.Valid {
		t.Error("expected invalid result for missing prefix")
	}
}

func TestShopifyVerifier_ValidSignature(t *testing.T) {
	v := &ShopifyVerifier{}
	body := []byte(`{"topic":"orders/create"}`)
	secret := "shopify_secret"

	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write(body)
	sig := base64.StdEncoding.EncodeToString(mac.Sum(nil))

	result := v.Verify(body, sig, secret)
	if !result.Valid {
		t.Errorf("expected valid signature, got error: %s", result.Error)
	}
}

func TestShopifyVerifier_InvalidSignature(t *testing.T) {
	v := &ShopifyVerifier{}
	// Valid base64 but wrong signature.
	result := v.Verify([]byte("body"), base64.StdEncoding.EncodeToString([]byte("wrong")), "secret")
	if result.Valid {
		t.Error("expected invalid signature")
	}
}

func TestHMACVerifier_SHA256(t *testing.T) {
	v := &HMACVerifier{Algorithm: "sha256"}
	body := []byte("test body")
	secret := "hmac_secret"

	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write(body)
	sig := hex.EncodeToString(mac.Sum(nil))

	result := v.Verify(body, sig, secret)
	if !result.Valid {
		t.Errorf("expected valid, got error: %s", result.Error)
	}
}

func TestHMACVerifier_SHA256Prefixed(t *testing.T) {
	v := &HMACVerifier{}
	body := []byte("test body")
	secret := "hmac_secret"

	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write(body)
	sig := "sha256=" + hex.EncodeToString(mac.Sum(nil))

	result := v.Verify(body, sig, secret)
	if !result.Valid {
		t.Errorf("expected valid, got error: %s", result.Error)
	}
}

func TestGetProvider(t *testing.T) {
	for _, name := range []string{"stripe", "github", "shopify", "hmac"} {
		p, err := GetProvider(name)
		if err != nil {
			t.Errorf("GetProvider(%q) returned error: %v", name, err)
		}
		if p.Name() != name {
			t.Errorf("expected provider name %q, got %q", name, p.Name())
		}
	}

	_, err := GetProvider("unknown")
	if err == nil {
		t.Error("expected error for unknown provider")
	}
}

func TestProviderNames(t *testing.T) {
	names := ProviderNames()
	if len(names) != 4 {
		t.Errorf("expected 4 providers, got %d", len(names))
	}
}
