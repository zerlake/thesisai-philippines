# Documentation Organization Script v2
# Moves files from root to docs structure (properly this time)

$fileMapping = @{
    # Getting Started
    "HOW_TO_RUN_EVERYTHING.md" = "docs/getting-started"
    "BUILD_INSTRUCTIONS.md" = "docs/getting-started"
    "DEPLOYMENT_VERIFICATION.md" = "docs/getting-started"
    "START_HERE.md" = "docs/getting-started"
    "START_HERE_SAMPLE_DATA.md" = "docs/getting-started"
    "START_HERE_SESSION_COMPLETE.md" = "docs/getting-started"
    
    # AI Tools & Features
    "GRAMMAR_CHECK_*.md" = "docs/features/ai-tools"
    "PUTER_*.md" = "docs/features/ai-tools"
    "AI_*.md" = "docs/features/ai-tools"
    "PAPER_SEARCH_*.md" = "docs/features/ai-tools"
    "MCP_*.md" = "docs/features/ai-tools"
    
    # Dashboard
    "DASHBOARD_*.md" = "docs/features/dashboard"
    "ENTERPRISE_DASHBOARD_*.md" = "docs/features/dashboard"
    
    # Messaging & Communications
    "MESSAGING_*.md" = "docs/features/messaging"
    "EMAIL_NOTIFICATIONS_*.md" = "docs/features/messaging"
    "CONVERSATION_*.md" = "docs/features/messaging"
    "MESSAGE_*.md" = "docs/features/messaging"
    "REALTIME_*.md" = "docs/features/messaging"
    
    # Advisor
    "ADVISOR_*.md" = "docs/features/advisor"
    
    # Thesis Phases
    "THESIS_PHASES_*.md" = "docs/features/thesis-phases"
    "RESEARCH_GAP_*.md" = "docs/features/thesis-phases"
    
    # Other Features
    "VALIDITY_DEFENDER_*.md" = "docs/features/other-features"
    "DEFENSE_PPT_*.md" = "docs/features/other-features"
    "AUTHOR_NETWORK_*.md" = "docs/features/other-features"
    "TOPIC_*.md" = "docs/features/other-features"
    "COMMAND_PALETTE_*.md" = "docs/features/other-features"
    
    # Personalization
    "PERSONALIZATION_*.md" = "docs/personalization"
    "PREFERENCES_*.md" = "docs/personalization"
    
    # Implementation - Completed
    "ALL_DELIVERABLES_COMPLETE.md" = "docs/implementation/completed"
    "IMPLEMENTATION_COMPLETE*.md" = "docs/implementation/completed"
    "PHASE_*_COMPLETION*.md" = "docs/implementation/completed"
    "PHASE_*_FINAL_*.md" = "docs/implementation/completed"
    "*COMPLETE.md" = "docs/implementation/completed"
    
    # Implementation - Phases
    "PHASE_1_*.md" = "docs/implementation/phases"
    "PHASE_2_*.md" = "docs/implementation/phases"
    "PHASE_3_*.md" = "docs/implementation/phases"
    "PHASE_4_*.md" = "docs/implementation/phases"
    "PHASE_5_*.md" = "docs/implementation/phases"
    "PHASE_AWARE_*.md" = "docs/implementation/phases"
    "PHASE_AWARENESS_*.md" = "docs/implementation/phases"
    "PHASE2_*.md" = "docs/implementation/phases"
    
    # Implementation - Sessions
    "SESSION_*.md" = "docs/implementation/sessions"
    "DELIVERABLES_*.md" = "docs/implementation/sessions"
    
    # Bug Fixes
    "AUTH_*.md" = "docs/bug-fixes/completed"
    "AUTHENTICATION_*.md" = "docs/bug-fixes/completed"
    "*FIX*.md" = "docs/bug-fixes/completed"
    "CORS_*.md" = "docs/bug-fixes/completed"
    "LOGIN_*.md" = "docs/bug-fixes/completed"
    "LOADING_*.md" = "docs/bug-fixes/completed"
    "INFINITE_*.md" = "docs/bug-fixes/completed"
    
    # Performance
    "LIGHTHOUSE_*.md" = "docs/performance"
    "PERFORMANCE_*.md" = "docs/performance"
    "OPTIMIZATION_*.md" = "docs/performance"
    
    # Accessibility
    "ACCESSIBILITY_*.md" = "docs/accessibility"
    "CUTTING_EDGE_*.md" = "docs/accessibility"
    "KEYBOARD_*.md" = "docs/accessibility"
    "HEURISTIC_*.md" = "docs/accessibility"
    
    # Frontend
    "LANDING_PAGE_*.md" = "docs/frontend/landing-page"
    "FEATURES_SECTION_*.md" = "docs/frontend/landing-page"
    "FOOTER_PAGES_*.md" = "docs/frontend/landing-page"
    "COMPONENT_*.md" = "docs/frontend/components"
    "SHADCN_DECK_*.md" = "docs/frontend/components"
    "EDITOR_*.md" = "docs/frontend/editor"
    
    # Backend
    "DIRECT_API_*.md" = "docs/backend/api"
    "API_*.md" = "docs/backend/api"
    "DB_*.md" = "docs/backend/database"
    "MIGRATION_*.md" = "docs/backend/database"
    "SERENA_*.md" = "docs/backend/integrations"
    
    # Deployment
    "AMP_CDN_*.md" = "docs/deployment"
    "DEPLOYMENT_*.md" = "docs/deployment"
    "NEXT_16_*.md" = "docs/deployment"
    "SUPABASE_*.md" = "docs/deployment"
    
    # Error Handling
    "ERROR_*.md" = "docs/error-handling"
    
    # Testing
    "INTEGRATION_*.md" = "docs/testing"
    "*TEST*.md" = "docs/testing"
    "TESTING_*.md" = "docs/testing"
    
    # Migration Guides
    "PUTER_AI_MIGRATION_*.md" = "docs/migration-guides"
    "COMPONENT_*_MIGRATION*.md" = "docs/migration-guides"
    "CLIENT_SIDE_*.md" = "docs/migration-guides"
    "MANUAL_MIGRATION_*.md" = "docs/migration-guides"
    
    # Premium Features
    "PREMIUM_*.md" = "docs/premium-features"
    "ENTERPRISE_*.md" = "docs/premium-features"
    "ENTERPRISE_TOPIC_*.md" = "docs/premium-features"
}

# Get all .md files in root
$mdFiles = @(Get-ChildItem -Path "c:\Users\Projects\thesis-ai-fresh" -Filter "*.md" -File)

Write-Host "Found $($mdFiles.Count) .md files in root"
Write-Host ""

$moveCount = 0
$skipCount = 0
$errorCount = 0

foreach ($file in $mdFiles) {
    # Skip files that should stay in root
    if ($file.Name -in @("AGENTS.md", "README.md")) {
        Write-Host "✓ KEEPING in root: $($file.Name)"
        $skipCount++
        continue
    }
    
    $destFolder = $null
    
    # Match file against patterns (order matters - specific patterns first)
    foreach ($pattern in $fileMapping.Keys) {
        if ($file.Name -like $pattern) {
            $destFolder = $fileMapping[$pattern]
            break
        }
    }
    
    # If no match found, archive it
    if ($null -eq $destFolder) {
        $destFolder = "docs/archived/deprecated"
    }
    
    # Create directory if it doesn't exist
    if (-Not (Test-Path $destFolder)) {
        New-Item -ItemType Directory -Path $destFolder -Force | Out-Null
        Write-Host "  Created directory: $destFolder"
    }
    
    # Move file
    $destPath = Join-Path $destFolder $file.Name
    
    try {
        Move-Item -Path $file.FullName -Destination $destPath -Force -ErrorAction Stop
        Write-Host "→ Moved: $($file.Name) → $destFolder"
        $moveCount++
    }
    catch {
        Write-Host "✗ ERROR moving $($file.Name): $_" -ForegroundColor Red
        $errorCount++
    }
}

Write-Host ""
Write-Host "=== SUMMARY ===" -ForegroundColor Green
Write-Host "Files moved: $moveCount"
Write-Host "Files kept in root: $skipCount"
Write-Host "Errors: $errorCount"

# Verify
$remaining = (Get-ChildItem -Path "c:\Users\Projects\thesis-ai-fresh" -Depth 0 -Filter '*.md' -File).Count
Write-Host ""
Write-Host "Files remaining in root: $remaining"
