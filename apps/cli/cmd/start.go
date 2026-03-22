package cmd

import (
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/nedanwr/hooktrace/apps/cli/internal/capture"
	"github.com/nedanwr/hooktrace/apps/cli/internal/forward"
	"github.com/nedanwr/hooktrace/apps/cli/internal/store"
	"github.com/nedanwr/hooktrace/apps/cli/internal/ui"
	"github.com/rs/zerolog/log"
	"github.com/spf13/cobra"
)

var (
	targetPort  int
	capturePort int
)

var startCmd = &cobra.Command{
	Use:   "start",
	Short: "Start capturing webhooks and forwarding to your local server",
	Long: `Starts the HookTrace capture server that listens for incoming webhooks,
forwards them to your local dev server, and displays them in the terminal.

Example:
  hooktrace start --port 3000`,
	RunE: runStart,
}

func init() {
	startCmd.Flags().IntVarP(&targetPort, "port", "p", 3000, "local dev server port to forward requests to")
	startCmd.Flags().IntVar(&capturePort, "capture-port", 9091, "port for the capture server to listen on")
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

	// On each captured request, forward to target and print to terminal.
	handler.OnRequest(func(req *store.CapturedRequest) {
		// Forward to the local dev server.
		if err := fwd.Forward(req); err != nil {
			log.Debug().Err(err).Msg("forward failed")
		}
		// Print the request row to terminal.
		ui.PrintRequest(req)
	})

	// Create and start capture server.
	srv := capture.NewServer(capturePort, handler)

	// Print startup banner.
	ui.PrintBanner(capturePort, targetPort)

	// Handle graceful shutdown.
	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		<-sigCh
		fmt.Println("\n\n  Shutting down...")
		if err := srv.Shutdown(); err != nil {
			log.Error().Err(err).Msg("shutdown error")
		}
	}()

	// Start the capture server (blocks).
	if err := srv.Start(); err != nil && err != http.ErrServerClosed {
		return fmt.Errorf("capture server error: %w", err)
	}

	return nil
}
