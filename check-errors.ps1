# PowerShell script to check TypeScript errors
$ErrorActionPreference = "Continue"

Write-Host "Running TypeScript compiler..." -ForegroundColor Yellow
pnpm tsc --noEmit --pretty false 2>&1 | Select-Object -First 100

Write-Host "`nDone." -ForegroundColor Green
