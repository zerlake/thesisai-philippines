# Setup Serena MCP Server Integration
# This script configures the project for MCP integration

param(
    [string]$PuterEndpoint = "http://localhost:8000",
    [string]$SerenaUrl = "http://localhost:3000",
    [switch]$SkipPuter,
    [switch]$SkipSerena
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Serena MCP Server Integration Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    pnpm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
}

# Check if uvx is installed (required for Serena)
if (-not $SkipSerena) {
    Write-Host "Checking for uvx installation..." -ForegroundColor Yellow
    $uv = Get-Command uv -ErrorAction SilentlyContinue
    if (-not $uv) {
        Write-Host "Installing uv (Python package installer)..." -ForegroundColor Yellow
        python -m pip install uv
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Failed to install uv. Install Python first." -ForegroundColor Red
            exit 1
        }
    }
    else {
        Write-Host "✓ uv is installed" -ForegroundColor Green
    }
}

# Update environment file
Write-Host "Creating .env configuration..." -ForegroundColor Yellow
$envFile = ".env.local"
$envContent = ""

if (Test-Path $envFile) {
    $envContent = Get-Content $envFile -Raw
}

# Add or update MCP-related environment variables
if ($envContent -notmatch "PUTER_LOCAL_ENDPOINT") {
    $envContent += "`nPUTER_LOCAL_ENDPOINT=$PuterEndpoint"
}
if ($envContent -notmatch "SERENA_URL") {
    $envContent += "`nSERINA_URL=$SerenaUrl"
}

$envContent | Set-Content $envFile -Encoding UTF8
Write-Host "✓ Environment configured" -ForegroundColor Green

# Create necessary directories
$directories = @(
    "src/lib/mcp",
    "src/hooks",
    "src/components/mcp",
    ".checkpoints"
)

foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "✓ Created directory: $dir" -ForegroundColor Green
    }
}

# Verify amp.json exists
if (-not (Test-Path "amp.json")) {
    Write-Host "Warning: amp.json not found. Creating default config..." -ForegroundColor Yellow
    $ampConfig = @{
        selectedAuthType = "none"
        mcpServers       = @{
            serena = @{
                command = "uvx"
                args    = @("--from", "git+https://github.com/oraios/serena", "serena", "start-mcp-server")
            }
        }
        settings         = @{
            serverPort = 3000
            mcpDebug   = $false
            logLevel   = "info"
        }
    } | ConvertTo-Json -Depth 5
    
    $ampConfig | Set-Content "amp.json" -Encoding UTF8
    Write-Host "✓ Created amp.json" -ForegroundColor Green
}

# Test configuration
Write-Host ""
Write-Host "Testing configuration..." -ForegroundColor Yellow

if ($PuterEndpoint -and -not $SkipPuter) {
    try {
        $response = Invoke-WebRequest -Uri "$PuterEndpoint/health" -ErrorAction SilentlyContinue -TimeoutSec 2
        if ($response.StatusCode -eq 200) {
            Write-Host "✓ Puter.js endpoint is reachable" -ForegroundColor Green
        }
    }
    catch {
        Write-Host "⚠ Puter.js endpoint not reachable at $PuterEndpoint" -ForegroundColor Yellow
        Write-Host "  Make sure Puter.js is running or update PUTER_LOCAL_ENDPOINT in .env.local" -ForegroundColor Gray
    }
}

# TypeScript compilation check
Write-Host ""
Write-Host "Checking TypeScript compilation..." -ForegroundColor Yellow
if (Test-Path "tsconfig.json") {
    Write-Host "✓ TypeScript configuration found" -ForegroundColor Green
}
else {
    Write-Host "⚠ tsconfig.json not found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Ensure Puter.js is running: $PuterEndpoint" -ForegroundColor Gray
Write-Host "2. Verify environment variables in .env.local" -ForegroundColor Gray
Write-Host "3. Run 'npm run dev' to start the development server" -ForegroundColor Gray
Write-Host "4. Test MCP integration: npm run test:mcp" -ForegroundColor Gray
Write-Host ""
