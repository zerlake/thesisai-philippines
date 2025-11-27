# Phase 5 Cleanup: Remove 25 unused Supabase functions
# Date: November 28, 2025
# Purpose: Clean up technical debt from Phase 5

Write-Host "Phase 5 Cleanup: Removing 25 unused Supabase functions" -ForegroundColor Cyan
Write-Host "=" * 70
Write-Host ""

$functionsToDelete = @(
    # Generation Functions (8)
    'generate-abstract',
    'generate-citation',
    'generate-citation-from-source',
    'generate-conclusion',
    'generate-defense-questions',
    'generate-feedback',
    'generate-flashcards',
    'generate-outline',
    
    # Presentation & Survey (4)
    'generate-presentation',
    'generate-presentation-slides',
    'generate-survey-questions',
    'generate-titles',
    
    # Research & Analysis (6)
    'check-originality',
    'check-internal-plagiarism',
    'interpret-results',
    'search-google-scholar',
    'search-web',
    'synthesize-literature',
    
    # Misc Functions (3)
    'ensure-demo-user',
    'get-serpapi-status',
    'call-arxiv-mcp-server',
    
    # Legacy AI Functions (2)
    'grammar-check',
    'paraphrase-text',
    
    # Data Processing (1)
    'pdf-analyzer'
)

$deleted = 0
$failed = 0

Write-Host "Deleting unused function directories..." -ForegroundColor Yellow
Write-Host ""

foreach ($func in $functionsToDelete) {
    $path = Join-Path -Path "supabase/functions" -ChildPath $func
    
    if (Test-Path $path) {
        try {
            Remove-Item -Path $path -Recurse -Force -ErrorAction Stop
            Write-Host "  ✓ $func" -ForegroundColor Green
            $deleted++
        } catch {
            Write-Host "  ✗ $func - Error: $_" -ForegroundColor Red
            $failed++
        }
    } else {
        Write-Host "  - $func (already missing)" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "=" * 70
Write-Host "Cleanup Results:" -ForegroundColor Cyan
Write-Host "  Deleted: $deleted" -ForegroundColor Green
Write-Host "  Failed:  $failed" -ForegroundColor $(if ($failed -eq 0) { 'Green' } else { 'Red' })
Write-Host "  Total:   $($functionsToDelete.Count)"
Write-Host ""

# Verify remaining functions
Write-Host "Active Supabase Functions Remaining:" -ForegroundColor Cyan
Write-Host ""

$remaining = Get-ChildItem -Path "supabase/functions" -Directory | Where-Object { $_.Name -ne '_shared' } | Select-Object -ExpandProperty Name | Sort-Object

$expectedActive = @(
    'advisor-invite-student',
    'align-questions-with-literature',
    'analyze-research-gaps',
    'check-plagiarism',
    'coinbase-webhook',
    'create-coinbase-charge',
    'generate-hypotheses',
    'generate-research-questions',
    'generate-topic-ideas',
    'generate-topic-ideas-enterprise',
    'manage-advisor-assignment',
    'manage-advisor-request',
    'manage-critic-request',
    'manage-institution-request',
    'manage-payout-request',
    'puter-ai-wrapper',
    'request-payout',
    'run-statistical-analysis',
    'send-reminder-notification',
    'transfer-credit',
    'update-user-role',
    'update-writing-streak'
)

$activeCount = 0
foreach ($func in $remaining) {
    if ($func -in $expectedActive) {
        Write-Host "  ✓ $func" -ForegroundColor Green
        $activeCount++
    } else {
        Write-Host "  ? $func (unexpected)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Active Functions Count: $activeCount / 23 expected"
Write-Host ""

Write-Host "=" * 70
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. pnpm build     # Verify build succeeds"
Write-Host "  2. pnpm test      # Run tests"
Write-Host "  3. pnpm lint      # Check for lint errors"
Write-Host "  4. git add -A && git commit -m 'Phase 5 cleanup: Remove 25 unused Supabase functions'"
Write-Host ""
Write-Host "Status: Phase 5 Cleanup Ready for Testing" -ForegroundColor Green
