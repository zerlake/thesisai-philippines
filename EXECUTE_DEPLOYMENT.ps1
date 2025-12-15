Set-Location "C:\Users\Projects\thesis-ai-fresh"

Write-Host "Starting Deployment Process..." -ForegroundColor Green
Write-Host "===============================" -ForegroundColor Cyan

Write-Host "`nChecking git status..." -ForegroundColor Yellow
git status

Write-Host "`nStaging all changes..." -ForegroundColor Yellow
git add .
Write-Host "Changes staged" -ForegroundColor Green

Write-Host "`nCommitting changes..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$commitMessage = "Deployment: $timestamp - Phase 5 Complete"
git commit -m $commitMessage
Write-Host "Committed: $commitMessage" -ForegroundColor Green

Write-Host "`nPushing to GitHub..." -ForegroundColor Yellow
git push origin main
Write-Host "Pushed to GitHub" -ForegroundColor Green

Write-Host "`nVerifying deployment..." -ForegroundColor Yellow
Write-Host "Current branch:" -ForegroundColor Cyan
git branch --show-current
Write-Host "Latest commit:" -ForegroundColor Cyan
git log --oneline -1

Write-Host "`nDeployment Complete!" -ForegroundColor Green
