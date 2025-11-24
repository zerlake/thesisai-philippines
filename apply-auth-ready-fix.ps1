# PowerShell script to apply useAuthReady fix to all AI components
# This adds the isReady check to prevent race conditions where session loads

$componentsToFix = @(
    "src\components\title-generator.tsx",
    "src\components\outline-generator.tsx",
    "src\components\enhanced-outline-generator.tsx",
    "src\components\conclusion-generator.tsx",
    "src\components\grammar-checker.tsx",
    "src\components\originality-check-panel.tsx",
    "src\components\topic-ideation-tool.tsx",
    "src\components\research-question-generator.tsx",
    "src\components\research-question-integration.tsx",
    "src\components\statistical-analysis-panel.tsx"
)

Write-Host "Starting auth-ready fix application..." -ForegroundColor Green

foreach ($file in $componentsToFix) {
    if (-not (Test-Path $file)) {
        Write-Host "  ⚠ $file not found, skipping..." -ForegroundColor Yellow
        continue
    }
    
    $content = Get-Content $file -Raw
    
    # Check if already fixed
    if ($content -like "*useAuthReady*") {
        Write-Host "  ✓ $file already has useAuthReady, skipping..." -ForegroundColor Cyan
        continue
    }
    
    # Check if has useAuth
    if ($content -notlike "*useAuth*") {
        Write-Host "  ⚠ $file doesn't use useAuth, skipping..." -ForegroundColor Yellow
        continue
    }
    
    Write-Host "  → Applying fix to $file..." -ForegroundColor Magenta
    
    # Add import
    if ($content -notlike "*import { useAuthReady }*") {
        $content = $content -replace "(import.*useAuth.*from.*auth-provider.*`r?`n)", "`$1import { useAuthReady } from `"@/hooks/use-auth-ready`";`n"
    }
    
    # Add hook usage in component function (looking for pattern like: const { session, supabase } = useAuth();)
    $content = $content -replace "(const \{ session[^}]*\} = useAuth\(\);)", "`$1`n  const { isReady } = useAuthReady();"
    
    Set-Content $file $content -NoNewline
    Write-Host "    ✓ Fixed" -ForegroundColor Green
}

Write-Host "`nFix application complete!" -ForegroundColor Green
