powershell -Version 5.1
# Documentation Organization Script

$mdFiles = @(Get-ChildItem -Path "c:\Users\Projects\thesis-ai-fresh" -Filter "*.md" -File)
Write-Host "Found $($mdFiles.Count) .md files in root"

$moveCount = 0
$skipCount = 0

foreach ($file in $mdFiles) {
    if ($file.Name -eq "AGENTS.md" -or $file.Name -eq "README.md") {
        Write-Host "KEEP: $($file.Name)"
        $skipCount++
        continue
    }
    
    $destFolder = "docs/archived/deprecated"
    
    # Categorize by pattern
    if ($file.Name -like "DASHBOARD*" -or $file.Name -like "ENTERPRISE_DASHBOARD*") {
        $destFolder = "docs/features/dashboard"
    }
    elseif ($file.Name -like "GRAMMAR_CHECK*" -or $file.Name -like "PUTER*" -or $file.Name -like "PAPER_SEARCH*" -or $file.Name -like "MCP*" -or $file.Name -like "AI_*") {
        $destFolder = "docs/features/ai-tools"
    }
    elseif ($file.Name -like "MESSAGING*" -or $file.Name -like "EMAIL_NOTIFICATIONS*" -or $file.Name -like "CONVERSATION*") {
        $destFolder = "docs/features/messaging"
    }
    elseif ($file.Name -like "ADVISOR*") {
        $destFolder = "docs/features/advisor"
    }
    elseif ($file.Name -like "THESIS_PHASES*" -or $file.Name -like "RESEARCH_GAP*") {
        $destFolder = "docs/features/thesis-phases"
    }
    elseif ($file.Name -like "VALIDITY_DEFENDER*" -or $file.Name -like "DEFENSE_PPT*" -or $file.Name -like "AUTHOR_NETWORK*" -or $file.Name -like "TOPIC_*" -or $file.Name -like "COMMAND_PALETTE*") {
        $destFolder = "docs/features/other-features"
    }
    elseif ($file.Name -like "PERSONALIZATION*" -or $file.Name -like "PREFERENCES*") {
        $destFolder = "docs/personalization"
    }
    elseif ($file.Name -like "PHASE_*" -or $file.Name -like "PHASE2*" -or $file.Name -like "PHASE_AWARE*" -or $file.Name -like "PHASE_AWARENESS*") {
        if ($file.Name -like "*COMPLETION*" -or $file.Name -like "*FINAL_*" -or $file.Name -like "*COMPLETE*") {
            $destFolder = "docs/implementation/completed"
        } else {
            $destFolder = "docs/implementation/phases"
        }
    }
    elseif ($file.Name -like "SESSION_*" -or $file.Name -like "DELIVERABLES_*") {
        $destFolder = "docs/implementation/sessions"
    }
    elseif ($file.Name -like "*FIX*" -or $file.Name -like "AUTH_*" -or $file.Name -like "AUTHENTICATION*") {
        $destFolder = "docs/bug-fixes/completed"
    }
    elseif ($file.Name -like "LIGHTHOUSE*" -or $file.Name -like "PERFORMANCE*" -or $file.Name -like "OPTIMIZATION*") {
        $destFolder = "docs/performance"
    }
    elseif ($file.Name -like "ACCESSIBILITY*" -or $file.Name -like "KEYBOARD*" -or $file.Name -like "HEURISTIC*") {
        $destFolder = "docs/accessibility"
    }
    elseif ($file.Name -like "LANDING_PAGE*" -or $file.Name -like "FEATURES_SECTION*" -or $file.Name -like "FOOTER_PAGES*") {
        $destFolder = "docs/frontend/landing-page"
    }
    elseif ($file.Name -like "COMPONENT_*" -or $file.Name -like "SHADCN_DECK*") {
        $destFolder = "docs/frontend/components"
    }
    elseif ($file.Name -like "EDITOR_*") {
        $destFolder = "docs/frontend/editor"
    }
    elseif ($file.Name -like "DIRECT_API*" -or $file.Name -like "API_*") {
        $destFolder = "docs/backend/api"
    }
    elseif ($file.Name -like "DB_*" -or $file.Name -like "MIGRATION_*") {
        $destFolder = "docs/backend/database"
    }
    elseif ($file.Name -like "SERENA*") {
        $destFolder = "docs/backend/integrations"
    }
    elseif ($file.Name -like "AMP_CDN*" -or $file.Name -like "DEPLOYMENT*" -or $file.Name -like "NEXT_16*" -or $file.Name -like "SUPABASE_*") {
        $destFolder = "docs/deployment"
    }
    elseif ($file.Name -like "ERROR_*") {
        $destFolder = "docs/error-handling"
    }
    elseif ($file.Name -like "INTEGRATION_TEST*" -or $file.Name -like "*TEST*" -or $file.Name -like "TESTING_*") {
        $destFolder = "docs/testing"
    }
    elseif ($file.Name -like "*MIGRATION*" -or $file.Name -like "CLIENT_SIDE*" -or $file.Name -like "MANUAL_MIGRATION*") {
        $destFolder = "docs/migration-guides"
    }
    elseif ($file.Name -like "PREMIUM_*" -or $file.Name -like "ENTERPRISE_*") {
        $destFolder = "docs/premium-features"
    }
    elseif ($file.Name -like "HOW_TO_RUN*" -or $file.Name -like "BUILD_INSTRUCTIONS*" -or $file.Name -like "START_HERE*") {
        $destFolder = "docs/getting-started"
    }
    
    # Create directory if needed
    if (-Not (Test-Path $destFolder)) {
        New-Item -ItemType Directory -Path $destFolder -Force | Out-Null
    }
    
    $destPath = Join-Path $destFolder $file.Name
    Move-Item -Path $file.FullName -Destination $destPath -Force -ErrorAction SilentlyContinue
    Write-Host "MOVE: $($file.Name) => $destFolder"
    $moveCount++
}

Write-Host ""
Write-Host "=== Summary ==="
Write-Host "Moved: $moveCount"
Write-Host "Kept: $skipCount"
