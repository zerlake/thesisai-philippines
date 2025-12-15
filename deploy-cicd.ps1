# CI/CD Deployment Script
# This script commits and pushes the CI/CD setup to GitHub

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CI/CD Deployment Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (!(Test-Path ".git")) {
    Write-Host "❌ Error: Not in a git repository!" -ForegroundColor Red
    Write-Host "Please run this script from the project root directory." -ForegroundColor Yellow
    exit 1
}

# Check current branch
$currentBranch = git rev-parse --abbrev-ref HEAD
Write-Host "📍 Current branch: $currentBranch" -ForegroundColor Green

if ($currentBranch -ne "main" -and $currentBranch -ne "master") {
    Write-Host "⚠️  Warning: You are not on main/master branch" -ForegroundColor Yellow
    Write-Host "Current branch: $currentBranch" -ForegroundColor Yellow
    $continue = Read-Host "Continue anyway? (y/N)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        Write-Host "❌ Deployment cancelled." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "Step 1: Checking for changes..." -ForegroundColor Cyan
Write-Host "─────────────────────────────────" -ForegroundColor Cyan

# Show status
$status = git status --porcelain
if ([string]::IsNullOrEmpty($status)) {
    Write-Host "ℹ️  No changes to commit." -ForegroundColor Yellow
    Write-Host "All CI/CD files may already be staged or committed." -ForegroundColor Yellow
    $continue = Read-Host "Continue with status check? (y/N)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        Write-Host "❌ Deployment cancelled." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Changes detected:" -ForegroundColor Green
    Write-Host $status
}

Write-Host ""
Write-Host "Step 2: Staging CI/CD files..." -ForegroundColor Cyan
Write-Host "────────────────────────────────" -ForegroundColor Cyan

# Stage workflow files
Write-Host "  • Staging workflow files (.github/workflows/)..."
git add .github/workflows/

# Stage configuration
Write-Host "  • Staging Lighthouse configuration..."
git add lighthouse-ci-config.json

# Stage documentation
Write-Host "  • Staging documentation files..."
git add CI_CD_*.md CI_CD_*.txt SETUP_COMPLETE_CI_CD.txt 2>$null

# Stage updated AGENTS.md
Write-Host "  • Staging AGENTS.md..."
git add AGENTS.md

Write-Host "✅ Files staged for commit" -ForegroundColor Green

Write-Host ""
Write-Host "Step 3: Verifying staged files..." -ForegroundColor Cyan
Write-Host "───────────────────────────────────" -ForegroundColor Cyan

$staged = git diff --cached --name-only
if ([string]::IsNullOrEmpty($staged)) {
    Write-Host "ℹ️  No new changes to commit." -ForegroundColor Yellow
} else {
    Write-Host "✅ Staged files:" -ForegroundColor Green
    $staged | ForEach-Object { Write-Host "   ✓ $_" }
}

Write-Host ""
Write-Host "Step 4: Creating commit..." -ForegroundColor Cyan
Write-Host "──────────────────────────" -ForegroundColor Cyan

$commitMessage = "ci: add GitHub Actions CI/CD pipeline"
Write-Host "Commit message: '$commitMessage'" -ForegroundColor Green

# Create commit
try {
    git commit -m $commitMessage 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Commit created successfully" -ForegroundColor Green
    } else {
        Write-Host "ℹ️  No changes to commit (already up to date)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Commit attempt completed" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 5: Pushing to GitHub..." -ForegroundColor Cyan
Write-Host "────────────────────────────" -ForegroundColor Cyan

# Verify remote exists
$remote = git remote -v | Select-String "origin"
if ([string]::IsNullOrEmpty($remote)) {
    Write-Host "❌ Error: No 'origin' remote found!" -ForegroundColor Red
    Write-Host "Please configure git remote first:" -ForegroundColor Yellow
    Write-Host "  git remote add origin <repository-url>" -ForegroundColor Yellow
    exit 1
}

Write-Host "Remote: $($remote[0])" -ForegroundColor Green

# Push to GitHub
Write-Host "Pushing to origin/$currentBranch..." -ForegroundColor Cyan
git push origin $currentBranch

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Push completed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Push failed!" -ForegroundColor Red
    Write-Host "Please check your network connection and try again." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ✅ Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📊 Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Monitor Workflows:" -ForegroundColor Green
Write-Host "   https://github.com/zerlake/thesisai-philippines/actions" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. Workflows will appear within 1-2 minutes" -ForegroundColor Green
Write-Host ""
Write-Host "3. First run will take approximately 30-45 minutes" -ForegroundColor Green
Write-Host ""
Write-Host "4. Check status for:" -ForegroundColor Green
Write-Host "   ✓ All 7 workflows execute" -ForegroundColor Yellow
Write-Host "   ✓ Tests pass" -ForegroundColor Yellow
Write-Host "   ✓ Coverage generates" -ForegroundColor Yellow
Write-Host "   ✓ Performance metrics collected" -ForegroundColor Yellow
Write-Host ""

Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  • Start with: CI_CD_INDEX.md" -ForegroundColor Yellow
Write-Host "  • Quick ref: CI_CD_QUICK_REFERENCE.md" -ForegroundColor Yellow
Write-Host "  • Full guide: CI_CD_SETUP_GUIDE.md" -ForegroundColor Yellow
Write-Host ""

Write-Host "✅ Ready! Monitor the workflows now." -ForegroundColor Green
