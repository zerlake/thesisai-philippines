# Start ArXiv MCP Server
# This script sets up and runs the MCP server

Write-Host "╔════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║           ArXiv MCP Server Startup Script                         ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Get current directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Write-Host "📁 Working directory: $scriptDir" -ForegroundColor Yellow
Write-Host ""

# Check if virtual environment exists
$venvPath = Join-Path $scriptDir ".venv"
if (Test-Path $venvPath) {
    Write-Host "✅ Virtual environment found" -ForegroundColor Green
} else {
    Write-Host "❌ Virtual environment NOT found. Creating it..." -ForegroundColor Red
    Write-Host ""
    Write-Host "Running: uv venv" -ForegroundColor Yellow
    & uv venv
    Write-Host ""
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
$activateScript = Join-Path $venvPath "Scripts\Activate.ps1"
if (Test-Path $activateScript) {
    & $activateScript
    Write-Host "✅ Virtual environment activated" -ForegroundColor Green
} else {
    Write-Host "❌ Could not find activate script at $activateScript" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📦 Checking dependencies..." -ForegroundColor Yellow
Write-Host ""

# Try to install/update dependencies
Write-Host "Running: uv pip install -e '.[test]'" -ForegroundColor Yellow
& uv pip install -e ".[test]"
Write-Host ""

# Start the server
Write-Host "╔════════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║           Starting ArXiv MCP Server                               ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Starting server on port 3001..." -ForegroundColor Cyan
Write-Host "   URL: http://localhost:3001" -ForegroundColor Cyan
Write-Host "   Docs: http://localhost:3001/docs" -ForegroundColor Cyan
Write-Host "   Health: http://localhost:3001/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the server
python -m arxiv_mcp_server --port 3001
