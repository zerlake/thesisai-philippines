#!/usr/bin/env pwsh

Write-Host "`n🚀 Starting Full Lighthouse Audit Pipeline`n" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Check if dev server is already running
Write-Host "`n📡 Checking if dev server is running..." -ForegroundColor Yellow

$processCheck = Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*next dev*" }

if ($processCheck) {
    Write-Host "✅ Dev server already running (PID: $($processCheck.Id))" -ForegroundColor Green
} else {
    Write-Host "Starting dev server..." -ForegroundColor Yellow
    
    # Start dev server in background
    $devProcess = Start-Process -FilePath "powershell.exe" -ArgumentList "-NoProfile -Command `"cd C:\Users\Projects\thesis-ai; pnpm dev`"" -PassThru
    Write-Host "✅ Dev server started (PID: $($devProcess.Id))" -ForegroundColor Green
    
    # Wait for server to be ready
    Write-Host "⏳ Waiting 15 seconds for server to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 15
}

# Wait for server to be ready
Write-Host "`n🔗 Checking server connectivity..." -ForegroundColor Yellow
$maxRetries = 10
$retryCount = 0

while ($retryCount -lt $maxRetries) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        Write-Host "✅ Server is ready!" -ForegroundColor Green
        break
    } catch {
        $retryCount++
        if ($retryCount -lt $maxRetries) {
            Write-Host "⏳ Waiting for server... (attempt $retryCount/$maxRetries)" -ForegroundColor Yellow
            Start-Sleep -Seconds 2
        } else {
            Write-Host "❌ Server not responding after $maxRetries attempts" -ForegroundColor Red
            exit 1
        }
    }
}

# Run the audit script
Write-Host "`n▶️  Running Lighthouse audits..." -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

node run-full-lighthouse-audit.js

Write-Host "`n✅ Audit pipeline complete!`n" -ForegroundColor Green
