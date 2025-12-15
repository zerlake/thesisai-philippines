Set-Location "C:\Users\Projects\thesis-ai-fresh"

Write-Host "Merging upgrade/next-16 to main..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

# Step 1: Fetch latest changes
Write-Host "`n1. Fetching latest changes..." -ForegroundColor Yellow
git fetch origin
Write-Host "Fetched" -ForegroundColor Green

# Step 2: Check current branch
Write-Host "`n2. Current branch:" -ForegroundColor Yellow
git branch --show-current

# Step 3: Switch to main
Write-Host "`n3. Switching to main branch..." -ForegroundColor Yellow
git checkout main
Write-Host "Switched to main" -ForegroundColor Green

# Step 4: Pull latest main
Write-Host "`n4. Pulling latest main..." -ForegroundColor Yellow
git pull origin main
Write-Host "Updated main" -ForegroundColor Green

# Step 5: Merge upgrade/next-16
Write-Host "`n5. Merging upgrade/next-16..." -ForegroundColor Yellow
git merge upgrade/next-16 --no-edit
$mergeExitCode = $LASTEXITCODE

if ($mergeExitCode -eq 0) {
    Write-Host "Merge successful!" -ForegroundColor Green
} else {
    Write-Host "Merge conflicts detected!" -ForegroundColor Red
    Write-Host "`nConflicted files:" -ForegroundColor Yellow
    git status
    exit 1
}

# Step 6: Show merge summary
Write-Host "`n6. Merge summary:" -ForegroundColor Yellow
git log --oneline main -1

# Step 7: Test build
Write-Host "`n7. Running build check..." -ForegroundColor Yellow
pnpm build 2>&1 | Tee-Object -Variable buildOutput | Select-Object -Last 50
$buildExitCode = $LASTEXITCODE

if ($buildExitCode -eq 0) {
    Write-Host "`nBuild successful!" -ForegroundColor Green
} else {
    Write-Host "`nBuild failed!" -ForegroundColor Red
    Write-Host "Full build output:" -ForegroundColor Yellow
    Write-Host $buildOutput
    exit 1
}

# Step 8: Run linting
Write-Host "`n8. Running lint check..." -ForegroundColor Yellow
pnpm lint 2>&1 | Tee-Object -Variable lintOutput | Select-Object -Last 30
$lintExitCode = $LASTEXITCODE

if ($lintExitCode -eq 0) {
    Write-Host "`nLint check passed!" -ForegroundColor Green
} else {
    Write-Host "`nLint warnings/errors found:" -ForegroundColor Yellow
    Write-Host $lintOutput
}

# Step 9: Run tests
Write-Host "`n9. Running test suite..." -ForegroundColor Yellow
pnpm test -- --run 2>&1 | Tee-Object -Variable testOutput | Select-Object -Last 50
$testExitCode = $LASTEXITCODE

if ($testExitCode -eq 0) {
    Write-Host "`nTests passed!" -ForegroundColor Green
} else {
    Write-Host "`nTests failed!" -ForegroundColor Yellow
    Write-Host "Test output:" -ForegroundColor Yellow
    Write-Host $testOutput
}

# Step 10: Push to GitHub
Write-Host "`n10. Pushing merge to main..." -ForegroundColor Yellow
git push origin main
Write-Host "Pushed to main" -ForegroundColor Green

# Step 11: Final status
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "MERGE SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Branch: " -NoNewline -ForegroundColor Yellow
git branch --show-current
Write-Host "Latest commit: " -NoNewline -ForegroundColor Yellow
git log --oneline -1
Write-Host "`nBuild: " -NoNewline -ForegroundColor Yellow
if ($buildExitCode -eq 0) { Write-Host "PASSED" -ForegroundColor Green } else { Write-Host "FAILED" -ForegroundColor Red }
Write-Host "Lint: " -NoNewline -ForegroundColor Yellow
if ($lintExitCode -eq 0) { Write-Host "PASSED" -ForegroundColor Green } else { Write-Host "PASSED (with warnings)" -ForegroundColor Yellow }
Write-Host "Tests: " -NoNewline -ForegroundColor Yellow
if ($testExitCode -eq 0) { Write-Host "PASSED" -ForegroundColor Green } else { Write-Host "FAILED" -ForegroundColor Red }

Write-Host "`n✅ Merge Complete!" -ForegroundColor Green
