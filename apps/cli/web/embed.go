// Package web embeds the built inspector React app.
package web

import (
	"embed"
	"io/fs"
)

//go:embed all:dist
var distFS embed.FS

// FS returns a filesystem rooted at the dist/ directory.
// Returns nil if the dist directory doesn't exist (development mode).
func FS() fs.FS {
	sub, err := fs.Sub(distFS, "dist")
	if err != nil {
		return nil
	}
	return sub
}
