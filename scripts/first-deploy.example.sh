#!/bin/bash

set -e

PROJECT_DIR="$HOME/Apps/PortfolioMonitor"
# Change this to your actual project location
BUN_BIN="$HOME/.bun/bin/bun"
CRON_FILE="/tmp/portfolio-monitor-cron"
SCRIPT_LOG="$PROJECT_DIR/logs/output.log"

echo "📦 Setting up Portfolio Monitor..."

# Step 0: Ensure project exists
if [ ! -d "$PROJECT_DIR" ]; then
  echo "❗ Project folder not found at $PROJECT_DIR"
  echo "👉 Please copy your code there first (e.g., from your dev machine):"
  echo "   scp -r portfolio-monitor userName@rpi.local:~/Apps/PortfolioMonitor"
  exit 1
fi

cd "$PROJECT_DIR"

# Step 1: Install Bun if missing
if [ ! -x "$BUN_BIN" ]; then
  echo "📥 Installing Bun..."
  curl -fsSL https://bun.sh/install | bash
fi

# Step 2: Install dependencies
echo "📦 Installing Bun packages..."
$BUN_BIN install

# Step 3: Create logs folder if needed
mkdir -p logs

# Step 4: First manual run
echo "🧪 Running first check..."
$BUN_BIN run src/index.js >> "$SCRIPT_LOG" 2>&1 || echo "⚠️ First run failed — check $SCRIPT_LOG"

# Step 5: Set timezone to Central (if needed)
echo "🌎 Setting timezone to America/Chicago (CT)..."
sudo timedatectl set-timezone America/Chicago

# Step 6: Create run.sh
cat > run.sh <<EOF
#!/bin/bash
cd "$PROJECT_DIR"
$BUN_BIN run src/index.js >> "$SCRIPT_LOG" 2>&1
EOF

chmod +x run.sh

# Step 7: Add cron job (Tue–Sat @ 6 AM CT)
echo "⏰ Scheduling cron job..."
cat > "$CRON_FILE" <<EOF
0 6 * * 2-6 $PROJECT_DIR/run.sh
EOF

crontab "$CRON_FILE"
rm "$CRON_FILE"

echo "✅ Deployment complete!"
echo "⏱ Script will run every Tue–Sat at 6:00 AM CT"
