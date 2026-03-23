package tunnel

// Tier represents a subscription tier.
type Tier int

const (
	TierFree Tier = iota
	TierPro
	TierTeam
)

// TunnelLimit returns the maximum number of simultaneous tunnels for a tier.
func TunnelLimit(tier Tier) int {
	switch tier {
	case TierPro:
		return 5
	case TierTeam:
		return 5
	default:
		return 1
	}
}
