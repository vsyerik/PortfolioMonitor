#!/bin/bash

set -e

# --- CONFIGURE ---
REMOTE_USER="vsyerik"
REMOTE_HOST="rpi-4.local"
REMOTE_PATH="~/Apps/PortfolioMonitor"
EXCLUDES="--exclude=data/portfolio.json --exclude=data/portfolio.local.json --exclude=scripts/first-deploy.sh --exclude=logs --exclude=db --exclude=node_modules --exclude=.git --exclude=.gitignore --exclude=README.md"

# --- CHECK LOCAL CONFIG EXISTS ---
if [ ! -f data/portfolio.local.json ]; then
  echo "❌ Missing data/portfolio.local.json — aborting."
  exit 1
fi

# --- SYNC ALL PROJECT FILES (EXCLUDING LOCAL-ONLY FILES) ---
echo "📤 Syncing code to Raspberry Pi..."
rsync -avz $EXCLUDES ./ ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}

# --- PUSH PERSONAL CONFIG AS portfolio.json ---
echo "📤 Syncing personal config (portfolio.local.json → portfolio.json)..."
scp data/portfolio.local.json ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/data/portfolio.json

echo "✅ Deployment complete using portfolio.local.json."
echo "ℹ️ To run manually:"
echo "   ssh ${REMOTE_USER}@${REMOTE_HOST}"
echo "   cd ${REMOTE_PATH} && ./run.sh"
