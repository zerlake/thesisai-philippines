# Documentation Organization Script
# Maps files to appropriate folders based on naming conventions and content

$fileMapping = @{
    # Getting Started
    "HOW_TO_RUN_EVERYTHING.md" = "docs/getting-started"
    "BUILD_INSTRUCTIONS.md" = "docs/getting-started"
    "DEPLOYMENT_VERIFICATION.md" = "docs/getting-started"
    "START_HERE.md" = "docs/getting-started"
    
    # AI Tools
    "GRAMMAR_CHECK_*.md" = "docs/features/ai-tools"
    "AI_*.md" = "docs/features/ai-tools"
    "PAPER_SEARCH_*.md" = "docs/features/ai-tools"
    
    # Dashboard
    "DASHBOARD_*.md" = "docs/features/dashboard"
    "ENTERPRISE_DASHBOARD_*.md" = "docs/features/dashboard"
    
    # Messaging
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
    "PERSONALIZATION_*.md" = "docs/personalization"
    
    # Implementation - Completed
    "ALL_DELIVERABLES_COMPLETE.md" = "docs/implementation/completed"
    "IMPLEMENTATION_COMPLETE*.md" = "docs/implementation/completed"
    "PHASE_*_COMPLETION*.md" = "docs/implementation/completed"
    "PHASE_*_FINAL_*.md" = "docs/implementation/completed"
    "*_COMPLETE.md" = "docs/implementation/completed"
    
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
    "SESSION_*_*.md" = "docs/implementation/sessions"
    "DELIVERABLES_*.md" = "docs/implementation/sessions"
    
    # Bug Fixes - Auth
    "AUTH_*.md" = "docs/bug-fixes/completed"
    "AUTHENTICATION_*.md" = "docs/bug-fixes/completed"
    
    # Bug Fixes - Dashboard
    "*DASHBOARD*FIX*.md" = "docs/bug-fixes/completed"
    
    # Bug Fixes - Infinite Loading
    "INFINITE_LOADING_*.md" = "docs/bug-fixes/completed"
    
    # Bug Fixes - Other
    "CORS_FIX_*.md" = "docs/bug-fixes/completed"
    "LOGIN_ISSUE_*.md" = "docs/bug-fixes/completed"
    "LOADING_ISSUE_*.md" = "docs/bug-fixes/completed"
    "*FIX*.md" = "docs/bug-fixes/completed"
    
    # Performance
    "LIGHTHOUSE_*.md" = "docs/performance"
    "PERFORMANCE_*.md" = "docs/performance"
    "OPTIMIZATION_*.md" = "docs/performance"
    
    # Accessibility
    "ACCESSIBILITY_*.md" = "docs/accessibility"
    "CUTTING_EDGE_ACCESSIBILITY.md" = "docs/accessibility"
    "KEYBOARD_NAVIGATION_*.md" = "docs/accessibility"
    "HEURISTIC_*.md" = "docs/accessibility"
    
    # Frontend - Landing Page
    "LANDING_PAGE_*.md" = "docs/frontend/landing-page"
    "FEATURES_SECTION_*.md" = "docs/frontend/landing-page"
    "FOOTER_PAGES_*.md" = "docs/frontend/landing-page"
    
    # Frontend - Components
    "COMPONENT_*.md" = "docs/frontend/components"
    "SHADCN_DECK_*.md" = "docs/frontend/components"
    
    # Frontend - Editor
    "EDITOR_*.md" = "docs/frontend/editor"
    
    # Backend - API
    "DIRECT_API_*.md" = "docs/backend/api"
    "API_*.md" = "docs/backend/api"
    
    # Backend - Database
    "DB_*.md" = "docs/backend/database"
    "MIGRATION_*.md" = "docs/backend/database"
    
    # Backend - Integrations
    "SERENA_*.md" = "docs/backend/integrations"
    
    # Deployment
    "AMP_CDN_*.md" = "docs/deployment"
    "DEPLOYMENT_*.md" = "docs/deployment"
    "NEXT_16_*.md" = "docs/deployment"
    "SUPABASE_DEPLOYMENT_*.md" = "docs/deployment"
    
    # Error Handling
    "ERROR_HANDLING_*.md" = "docs/error-handling"
    "ADVANCED_ERROR_HANDLING_*.md" = "docs/error-handling"
    
    # Testing
    "INTEGRATION_TEST_*.md" = "docs/testing"
    "*TEST*.md" = "docs/testing"
    
    # Migration Guides
    "PUTER_AI_MIGRATION_*.md" = "docs/migration-guides"
    "COMPONENT_*_MIGRATION*.md" = "docs/migration-guides"
    "CLIENT_SIDE_*.md" = "docs/migration-guides"
    
    # Premium Features
    "PREMIUM_*.md" = "docs/premium-features"
    "ENTERPRISE_*.md" = "docs/premium-features"
    "TOPIC_GENERATOR_*.md" = "docs/premium-features"
    
    # Reference
    "AGENTS.md" = "docs/reference"
    "AI_RULES.md" = "docs/reference"
    "DOCUMENTATION_*.md" = "docs/reference"
    "*QUICK_REFERENCE*.md" = "docs/reference"
}

# Get all .md files in root
$mdFiles = Get-ChildItem -Path "c:\Users\Projects\thesis-ai-fresh" -Filter "*.md" -File

$moveCount = 0
$skipCount = 0

foreach ($file in $mdFiles) {
    $destFolder = $null
    
    # Match file against patterns
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
    
    # Skip files that should stay in root
    if ($file.Name -in @("AGENTS.md", "README.md")) {
        Write-Host "KEEPING in root: $($file.Name)"
        $skipCount++
        continue
    }
    
    # Move file
    $destPath = Join-Path $destFolder $file.Name
    Move-Item -Path $file.FullName -Destination $destPath -Force -ErrorAction Continue
    Write-Host "Moved: $($file.Name) -> $destFolder"
    $moveCount++
}

Write-Host "`n=== SUMMARY ==="
Write-Host "Files moved: $moveCount"
Write-Host "Files kept in root: $skipCount"
