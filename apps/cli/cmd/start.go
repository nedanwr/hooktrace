package cmd

import (
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/nedanwr/tunnl/apps/cli/internal/capture"
	"github.com/nedanwr/tunnl/apps/cli/internal/config"
	"github.com/nedanwr/tunnl/apps/cli/internal/forward"
	"github.com/nedanwr/tunnl/apps/cli/internal/inspector"
	"github.com/nedanwr/tunnl/apps/cli/internal/replay"
	"github.com/nedanwr/tunnl/apps/cli/internal/store"
	"github.com/nedanwr/tunnl/apps/cli/internal/tunnel"
	"github.com/nedanwr/tunnl/apps/cli/internal/ui"
	"github.com/nedanwr/tunnl/apps/cli/web"
	"github.com/pkg/browser"
	"github.com/rs/zerolog/log"
	"github.com/spf13/cobra"
)

var (
	targetPort    int
	capturePort   int
	inspectorPort int
	noOpen   bool
	relayURL string
)

var startCmd = &cobra.Command{
	Use:   "start",
	Short: "Start capturing webhooks and forwarding to your local server",
	Long: `Starts the Tunnl capture server that listens for incoming webhooks,
forwards them to your local dev server, and displays them in the terminal.
Also starts the web inspector and connects to the relay for a public tunnel URL.

Example:
  tunnl start --port 3000`,
	RunE: runStart,
}

func init() {
	startCmd.Flags().IntVarP(&targetPort, "port", "p", 3000, "local dev server port to forward requests to")
	startCmd.Flags().IntVar(&capturePort, "capture-port", 9091, "port for the capture server to listen on")
	startCmd.Flags().IntVar(&inspectorPort, "inspector-port", 9090, "port for the web inspector")
	startCmd.Flags().BoolVar(&noOpen, "no-open", false, "don't auto-open the inspector in the browser")
	startCmd.Flags().StringVar(&relayURL, "relay", "ws://localhost:8080", "relay server URL")
	rootCmd.AddCommand(startCmd)
}

func runStart(cmd *cobra.Command, args []string) error {
	// Load persistent config.
	cfg, err := config.Load()
	if err != nil {
		log.Warn().Err(err).Msg("could not load config, using defaults")
		cfg = &config.Config{ClientID: "anonymous"}
	}

	// Allow config to override relay URL.
	if cfg.RelayURL != "" && !cmd.Flags().Changed("relay") {
		relayURL = cfg.RelayURL
	}

	// Initialize store.
	memStore := store.NewMemoryStore(store.DefaultCapacity)

	// Initialize capture handler.
	handler := capture.NewHandler(memStore)

	// Initialize forwarder.
	targetURL := fmt.Sprintf("http://localhost:%d", targetPort)
	fwd := forward.New(targetURL)

	// Initialize inspector server with embedded SPA.
	inspectorSrv := inspector.NewServer(inspectorPort, memStore, web.FS())

	// replayBroadcast is used by the replayer to broadcast + print new requests.
	replayBroadcast := func(req *store.CapturedRequest) {
		inspectorSrv.Hub().Broadcast(inspector.WSEvent{
			Type: "request:new",
			Data: req,
		})
		ui.PrintRequest(req)
	}

	// Initialize replayer for replay and mock webhook support.
	replayer := replay.New(targetURL, memStore, replayBroadcast)
	inspectorSrv.SetReplayer(replayer)

	// forwardAndBroadcast forwards a captured request to the local dev server,
	// broadcasts to inspector, and prints to terminal.
	forwardAndBroadcast := func(req *store.CapturedRequest) {
		// Forward to the local dev server.
		if err := fwd.Forward(req); err != nil {
			log.Debug().Err(err).Msg("forward failed")
		}

		// Broadcast to inspector WebSocket clients.
		inspectorSrv.Hub().Broadcast(inspector.WSEvent{
			Type: "request:new",
			Data: req,
		})

		// Print the request row to terminal.
		ui.PrintRequest(req)
	}

	// On each captured request from the local capture server, forward + broadcast.
	// Note: the capture server already stores the request in the handler's store.
	handler.OnRequest(forwardAndBroadcast)

	// processTunnelRequest handles requests arriving via the tunnel.
	// Unlike direct capture, these need to be stored explicitly since they
	// bypass the capture server.
	processTunnelRequest := func(req *store.CapturedRequest) {
		memStore.Add(req)
		forwardAndBroadcast(req)
	}

	// Create capture server.
	captureSrv := capture.NewServer(capturePort, handler)

	// Print startup banner.
	ui.PrintBanner(capturePort, targetPort)
	inspectorURL := fmt.Sprintf("http://localhost:%d", inspectorPort)
	fmt.Printf("  Inspector:     %s\n", inspectorURL)

	// Start inspector server in background.
	go func() {
		if err := inspectorSrv.Start(); err != nil && err != http.ErrServerClosed {
			log.Error().Err(err).Msg("inspector server error")
		}
	}()

	// Set up tunnel connection.
	tunnelClient := tunnel.NewClient(relayURL, cfg.ClientID, cfg.Subdomain, processTunnelRequest)

	go tunnel.ConnectWithReconnect(tunnelClient, func(publicURL string) {
		ui.PrintTunnelStatus(publicURL)

		// Persist the subdomain from the public URL for stable reconnection.
		subdomain := tunnel.ExtractSubdomain(publicURL)
		if subdomain != "" && subdomain != cfg.Subdomain {
			cfg.Subdomain = subdomain
			if err := cfg.Save(); err != nil {
				log.Debug().Err(err).Msg("failed to save subdomain to config")
			}
		}
	})

	fmt.Printf("  Tunnel:        connecting...\n")

	fmt.Println()

	// Auto-open browser.
	if !noOpen {
		go func() {
			if err := browser.OpenURL(inspectorURL); err != nil {
				log.Debug().Err(err).Msg("could not open browser")
			}
		}()
	}

	// Handle graceful shutdown.
	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		<-sigCh
		fmt.Println("\n\n  Shutting down...")
		tunnelClient.Stop()
		if err := inspectorSrv.Shutdown(); err != nil {
			log.Error().Err(err).Msg("inspector shutdown error")
		}
		if err := captureSrv.Shutdown(); err != nil {
			log.Error().Err(err).Msg("capture shutdown error")
		}
	}()

	// Start the capture server (blocks).
	if err := captureSrv.Start(); err != nil && err != http.ErrServerClosed {
		return fmt.Errorf("capture server error: %w", err)
	}

	return nil
}
