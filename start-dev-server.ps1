$ErrorActionPreference = "SilentlyContinue"
cd 'c:\Users\Projects\thesis-ai'

# Start dev server in background
Start-Process -FilePath "pnpm" -ArgumentList "dev" -NoNewWindow -RedirectStandardOutput "dev-server.log" -RedirectStandardError "dev-server-error.log"

Write-Host "Starting dev server..."
Write-Host "Waiting for server to be ready..."

# Wait for dev server to be ready
$maxAttempts = 30
$attempt = 0
$serverReady = $false

while ($attempt -lt $maxAttempts) {
    $attempt++
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/" -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $serverReady = $true
            break
        }
    } catch {
        # Server not ready yet
    }
    Start-Sleep -Milliseconds 500
}

if ($serverReady) {
    Write-Host "Dev server ready at http://localhost:3000"
} else {
    Write-Host "Dev server startup timeout - check dev-server.log"
}
