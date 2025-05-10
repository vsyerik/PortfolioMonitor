#!/bin/bash

# --- CONFIG ---
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
BUN_BIN="$HOME/.bun/bin/bun"
LOG_FILE="$PROJECT_DIR/logs/output.log"

# --- RUN ---
# shellcheck disable=SC2164
cd "$PROJECT_DIR"
$BUN_BIN run src/index.js >> "$LOG_FILE" 2>&1
