// Package ui provides colored terminal output for the CLI.
package ui

import (
	"fmt"
	"strings"
	"time"

	"github.com/fatih/color"
	"github.com/nedanwr/tunnl/apps/cli/internal/store"
)

var (
	headerColor    = color.New(color.FgCyan, color.Bold)
	methodColor    = color.New(color.FgWhite, color.Bold)
	pathColor      = color.New(color.FgWhite)
	timeColor      = color.New(color.FgHiBlack)
	idColor        = color.New(color.FgHiBlack)
	successColor   = color.New(color.FgGreen)
	redirectColor  = color.New(color.FgYellow)
	clientErrColor = color.New(color.FgYellow, color.Bold)
	serverErrColor = color.New(color.FgRed, color.Bold)
	logoColor      = color.New(color.FgMagenta, color.Bold)
	tunnelColor    = color.New(color.FgGreen, color.Bold)
)

// PrintBanner prints the Tunnl startup banner.
func PrintBanner(capturePort int, targetPort int) {
	logoColor.Println("\n  ⚡ Tunnl")
	fmt.Println()
	fmt.Printf("  Capture URL:   http://localhost:%d\n", capturePort)
	fmt.Printf("  Forwarding to: http://localhost:%d\n", targetPort)
	fmt.Println()
	headerColor.Printf("  %-6s  %-30s  %-6s  %-8s  %s\n", "METHOD", "PATH", "STATUS", "LATENCY", "ID")
	fmt.Println("  " + strings.Repeat("─", 78))
}

// PrintRequest prints a single captured request as a colored table row.
func PrintRequest(req *store.CapturedRequest) {
	status := 0
	if req.Response != nil {
		status = req.Response.StatusCode
	}

	statusStr := fmt.Sprintf("%d", status)
	if status == 0 {
		statusStr = "---"
	}

	latency := formatDuration(req.Duration)

	// Truncate path if too long.
	path := req.Path
	if req.Query != "" {
		path += "?" + req.Query
	}
	if len(path) > 30 {
		path = path[:27] + "..."
	}

	fmt.Print("  ")
	methodColor.Printf("%-6s", req.Method)
	fmt.Print("  ")
	pathColor.Printf("%-30s", path)
	fmt.Print("  ")
	statusColorFn(status).Printf("%-6s", statusStr)
	fmt.Print("  ")
	timeColor.Printf("%-8s", latency)
	fmt.Print("  ")
	idColor.Printf("%s", req.ID[:8])
	fmt.Println()
}

func statusColorFn(code int) *color.Color {
	switch {
	case code == 0:
		return timeColor
	case code < 300:
		return successColor
	case code < 400:
		return redirectColor
	case code < 500:
		return clientErrColor
	default:
		return serverErrColor
	}
}

// PrintTunnelStatus prints the tunnel URL when connection is established.
func PrintTunnelStatus(publicURL string) {
	fmt.Print("\r  Tunnel:        ")
	tunnelColor.Printf("%s", publicURL)
	fmt.Println()
}

func formatDuration(d time.Duration) string {
	switch {
	case d < time.Millisecond:
		return fmt.Sprintf("%dμs", d.Microseconds())
	case d < time.Second:
		return fmt.Sprintf("%dms", d.Milliseconds())
	default:
		return fmt.Sprintf("%.1fs", d.Seconds())
	}
}
