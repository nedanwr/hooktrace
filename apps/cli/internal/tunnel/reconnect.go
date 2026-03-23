package tunnel

import (
	"math"
	"time"

	"github.com/rs/zerolog/log"
)

const (
	initialBackoff = 1 * time.Second
	maxBackoff     = 30 * time.Second
	maxRetries     = 0 // 0 = unlimited
)

// ConnectWithReconnect connects to the relay and automatically reconnects
// with exponential backoff on disconnection. It calls onConnected each time
// a connection is successfully established.
//
// This function blocks until Stop is called on the client.
func ConnectWithReconnect(c *Client, onConnected func(publicURL string)) {
	attempt := 0

	for {
		select {
		case <-c.stopCh:
			return
		default:
		}

		publicURL, err := c.Connect()
		if err != nil {
			attempt++
			backoff := calculateBackoff(attempt)

			log.Warn().
				Err(err).
				Int("attempt", attempt).
				Dur("backoff", backoff).
				Msg("tunnel connection failed, retrying")

			select {
			case <-c.stopCh:
				return
			case <-time.After(backoff):
				continue
			}
		}

		// Connected successfully — reset attempt counter.
		attempt = 0
		onConnected(publicURL)

		// Listen blocks until the connection drops.
		if err := c.Listen(); err != nil {
			log.Warn().Err(err).Msg("tunnel disconnected")
		}

		// Connection dropped — reconnect after brief delay.
		select {
		case <-c.stopCh:
			return
		case <-time.After(initialBackoff):
		}
	}
}

func calculateBackoff(attempt int) time.Duration {
	backoff := float64(initialBackoff) * math.Pow(2, float64(attempt-1))
	if backoff > float64(maxBackoff) {
		backoff = float64(maxBackoff)
	}
	return time.Duration(backoff)
}
