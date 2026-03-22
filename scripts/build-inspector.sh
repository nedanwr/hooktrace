#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
INSPECTOR_DIR="$ROOT_DIR/apps/inspector"
DIST_DIR="$ROOT_DIR/apps/cli/web/dist"

echo "Building inspector UI..."

# Install dependencies if needed.
if [ ! -d "$INSPECTOR_DIR/node_modules" ]; then
    echo "Installing inspector dependencies..."
    (cd "$INSPECTOR_DIR" && npm install)
fi

# Build the React app.
(cd "$INSPECTOR_DIR" && npm run build)

# Copy build output to the CLI embed directory.
rm -rf "$DIST_DIR"
cp -r "$INSPECTOR_DIR/dist" "$DIST_DIR"

echo "Inspector built → $DIST_DIR"
