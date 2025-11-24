#!/bin/bash

# Setup Serena MCP Server Integration
# This script configures the project for MCP integration

set -e

PUTER_ENDPOINT="${1:-http://localhost:8000}"
SERENA_URL="${2:-http://localhost:3000}"
SKIP_PUTER="${SKIP_PUTER:-false}"
SKIP_SERENA="${SKIP_SERENA:-false}"

echo "========================================"
echo "Serena MCP Server Integration Setup"
echo "========================================"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    pnpm install
    if [ $? -ne 0 ]; then
        echo "Failed to install dependencies"
        exit 1
    fi
fi

# Check if uvx is installed (required for Serena)
if [ "$SKIP_SERENA" != "true" ]; then
    echo "Checking for uvx installation..."
    if ! command -v uv &> /dev/null; then
        echo "Installing uv (Python package installer)..."
        python -m pip install uv
        if [ $? -ne 0 ]; then
            echo "Failed to install uv. Install Python first."
            exit 1
        fi
    else
        echo "✓ uv is installed"
    fi
fi

# Update environment file
echo "Creating .env configuration..."
ENV_FILE=".env.local"

if [ ! -f "$ENV_FILE" ]; then
    touch "$ENV_FILE"
fi

# Add or update MCP-related environment variables
if ! grep -q "PUTER_LOCAL_ENDPOINT" "$ENV_FILE"; then
    echo "PUTER_LOCAL_ENDPOINT=$PUTER_ENDPOINT" >> "$ENV_FILE"
fi

if ! grep -q "SERENA_URL" "$ENV_FILE"; then
    echo "SERENA_URL=$SERENA_URL" >> "$ENV_FILE"
fi

echo "✓ Environment configured"

# Create necessary directories
DIRS=(
    "src/lib/mcp"
    "src/hooks"
    "src/components/mcp"
    ".checkpoints"
)

for dir in "${DIRS[@]}"; do
    if [ ! -d "$dir" ]; then
        mkdir -p "$dir"
        echo "✓ Created directory: $dir"
    fi
done

# Verify amp.json exists
if [ ! -f "amp.json" ]; then
    echo "Warning: amp.json not found. Creating default config..."
    cat > amp.json << 'EOF'
{
  "selectedAuthType": "none",
  "mcpServers": {
    "serena": {
      "command": "uvx",
      "args": ["--from", "git+https://github.com/oraios/serena", "serena", "start-mcp-server"]
    }
  },
  "settings": {
    "serverPort": 3000,
    "mcpDebug": false,
    "logLevel": "info"
  }
}
EOF
    echo "✓ Created amp.json"
fi

# Test configuration
echo ""
echo "Testing configuration..."

if [ "$SKIP_PUTER" != "true" ]; then
    if command -v curl &> /dev/null; then
        if curl -s -o /dev/null -w "%{http_code}" --max-time 2 "$PUTER_ENDPOINT/health" | grep -q "200"; then
            echo "✓ Puter.js endpoint is reachable"
        else
            echo "⚠ Puter.js endpoint not reachable at $PUTER_ENDPOINT"
            echo "  Make sure Puter.js is running or update PUTER_LOCAL_ENDPOINT in .env.local"
        fi
    fi
fi

# TypeScript compilation check
echo ""
echo "Checking TypeScript compilation..."
if [ -f "tsconfig.json" ]; then
    echo "✓ TypeScript configuration found"
else
    echo "⚠ tsconfig.json not found"
fi

echo ""
echo "========================================"
echo "Setup Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Ensure Puter.js is running: $PUTER_ENDPOINT"
echo "2. Verify environment variables in .env.local"
echo "3. Run 'npm run dev' to start the development server"
echo "4. Test MCP integration: npm run test:mcp"
echo ""
