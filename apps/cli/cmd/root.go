// Package cmd implements the CLI commands for hooktrace.
package cmd

import (
	"os"

	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	"github.com/spf13/cobra"
)

var verbose bool

var rootCmd = &cobra.Command{
	Use:   "hooktrace",
	Short: "Webhook debugger, tunnel & replay platform",
	Long: `HookTrace captures incoming webhooks, forwards them to your local
dev server, and gives you a beautiful inspector to debug, replay, and diff requests.

Run "hooktrace start --port 3000" to get started.`,
	PersistentPreRun: func(cmd *cobra.Command, args []string) {
		// Configure zerolog.
		zerolog.TimeFieldFormat = zerolog.TimeFormatUnix
		log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})
		if verbose {
			zerolog.SetGlobalLevel(zerolog.DebugLevel)
		} else {
			zerolog.SetGlobalLevel(zerolog.InfoLevel)
		}
	},
}

func init() {
	rootCmd.PersistentFlags().BoolVarP(&verbose, "verbose", "v", false, "enable debug logging")
}

// Execute runs the root command.
func Execute() {
	if err := rootCmd.Execute(); err != nil {
		os.Exit(1)
	}
}
