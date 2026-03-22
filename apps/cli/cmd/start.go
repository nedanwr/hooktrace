package cmd

import (
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/nedanwr/hooktrace/apps/cli/internal/capture"
	"github.com/nedanwr/hooktrace/apps/cli/internal/forward"
	"github.com/nedanwr/hooktrace/apps/cli/internal/inspector"
	"github.com/nedanwr/hooktrace/apps/cli/internal/store"
	"github.com/nedanwr/hooktrace/apps/cli/internal/ui"
	"github.com/nedanwr/hooktrace/apps/cli/web"
	"github.com/pkg/browser"
	"github.com/rs/zerolog/log"
	"github.com/spf13/cobra"
)

var (
	targetPort    int
	capturePort   int
	inspectorPort int
	noOpen        bool
)

var startCmd = &cobra.Command{
	Use:   "start",
	Short: "Start capturing webhooks and forwarding to your local server",
	Long: `Starts the HookTrace capture server that listens for incoming webhooks,
forwards them to your local dev server, and displays them in the terminal.
Also starts the web inspector for debugging requests in the browser.

Example:
  hooktrace start --port 3000`,
	RunE: runStart,
}

func init() {
	startCmd.Flags().IntVarP(&targetPort, "port", "p", 3000, "local dev server port to forward requests to")
	startCmd.Flags().IntVar(&capturePort, "capture-port", 9091, "port for the capture server to listen on")
	startCmd.Flags().IntVar(&inspectorPort, "inspector-port", 9090, "port for the web inspector")
	startCmd.Flags().BoolVar(&noOpen, "no-open", false, "don't auto-open the inspector in the browser")
	rootCmd.AddCommand(startCmd)
}

func runStart(cmd *cobra.Command, args []string) error {
	// Initialize store.
	memStore := store.NewMemoryStore(store.DefaultCapacity)

	// Initialize capture handler.
	handler := capture.NewHandler(memStore)

	// Initialize forwarder.
	targetURL := fmt.Sprintf("http://localhost:%d", targetPort)
	fwd := forward.New(targetURL)

	// Initialize inspector server with embedded SPA.
	inspectorSrv := inspector.NewServer(inspectorPort, memStore, web.FS())

	// On each captured request, forward to target, broadcast to inspector, and print to terminal.
	handler.OnRequest(func(req *store.CapturedRequest) {
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
	})

	// Create capture server.
	captureSrv := capture.NewServer(capturePort, handler)

	// Print startup banner.
	ui.PrintBanner(capturePort, targetPort)
	inspectorURL := fmt.Sprintf("http://localhost:%d", inspectorPort)
	fmt.Printf("  Inspector:     %s\n\n", inspectorURL)

	// Start inspector server in background.
	go func() {
		if err := inspectorSrv.Start(); err != nil && err != http.ErrServerClosed {
			log.Error().Err(err).Msg("inspector server error")
		}
	}()

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
