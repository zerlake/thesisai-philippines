<#
.SYNOPSIS
  Scans a JavaScript/TypeScript codebase for hardcoded secrets, common security vulnerabilities, unused imports, and dependency vulnerabilities.
.DESCRIPTION
  - Shows details if -ShowDetails is set.
  - Adds case-insensitive regex for secrets/vulnerabilities.
  - Handles read errors and locked files gracefully.
  - Uses -File for performance on Get-ChildItem.
  - Clarifies limitations for import detection.
  - Better error and output management.
.PARAMETER ProjectPath
  Path to the project directory to scan. Defaults to current directory.
.PARAMETER ShowDetails
  Show detailed information for ESLint findings.
.EXAMPLE
  .\SecurityScanner.ps1 -ProjectPath "C:\MyProject" -ShowDetails
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$ProjectPath = ".",
    
    [Parameter(Mandatory=$false)]
    [switch]$ShowDetails = $false
)

# Ensure we're using UTF8 encoding for better compatibility
$PSDefaultParameterValues['Out-File:Encoding'] = 'utf8'
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "Starting vulnerability and unused code scan..." -ForegroundColor Green
Write-Host "Target Path: $(Resolve-Path $ProjectPath)`n" -ForegroundColor Cyan

function Find-HardcodedSecrets {
    param([string]$Path)

    Write-Host "`n1. Scanning for hardcoded secrets..." -ForegroundColor Yellow

    # Define patterns with descriptions
    $patterns = @()
    $patterns += @{Pattern='(?i)password\s*[:=]\s*.{3,}'; Type='Password'}
    $patterns += @{Pattern='(?i)secret\s*[:=]\s*.{3,}'; Type='Secret'}
    $patterns += @{Pattern='(?i)api[_-]?key\s*[:=]\s*.{10,}'; Type='API Key'}
    $patterns += @{Pattern='(?i)access[_-]?token\s*[:=]\s*.{10,}'; Type='Access Token'}
    $patterns += @{Pattern='(?i)auth[_-]?token\s*[:=]\s*.{10,}'; Type='Auth Token'}
    $patterns += @{Pattern='(?i)client[_-]?secret\s*[:=]\s*.{10,}'; Type='Client Secret'}
    $patterns += @{Pattern='(?i)private[_-]?key\s*[:=]'; Type='Private Key'}
    $patterns += @{Pattern='(?i)bearer\s+[a-zA-Z0-9\-_]{20,}'; Type='Bearer Token'}
    $patterns += @{Pattern='sk-[a-zA-Z0-9]{32,}'; Type='OpenAI Secret Key'}
    $patterns += @{Pattern='pk-[a-zA-Z0-9]{32,}'; Type='OpenAI Publishable Key'}
    $patterns += @{Pattern='(?i)AWS_SECRET_ACCESS_KEY\s*[:=]'; Type='AWS Secret'}
    $patterns += @{Pattern='(?i)GITHUB_TOKEN\s*[:=]'; Type='GitHub Token'}
    $patterns += @{Pattern='(?i)SLACK_TOKEN\s*[:=]'; Type='Slack Token'}
    $patterns += @{Pattern='(?i)STRIPE_SECRET_KEY\s*[:=]'; Type='Stripe Secret'}
    $patterns += @{Pattern='ghp_[a-zA-Z0-9]{36}'; Type='GitHub Personal Access Token'}
    $patterns += @{Pattern='gho_[a-zA-Z0-9]{36}'; Type='GitHub OAuth Token'}
    $patterns += @{Pattern='AIza[0-9A-Za-z\-_]{35}'; Type='Google API Key'}
    $patterns += @{Pattern='ya29\.[0-9A-Za-z\-_]+'; Type='Google OAuth Token'}
    $patterns += @{Pattern='AKIA[0-9A-Z]{16}'; Type='AWS Access Key'}
    $patterns += @{Pattern='(?i)DB_PASSWORD\s*[:=]\s*.{3,}'; Type='Database Password'}
    $patterns += @{Pattern='(?i)jwt[_-]?secret\s*[:=]'; Type='JWT Secret'}

    $excludeDirs = @('node_modules', '.git', 'dist', 'build', 'coverage', '.next', 'out')
    $files = Get-ChildItem -Path $Path -Recurse -Include "*.ts", "*.tsx", "*.js", "*.jsx", "*.json", "*.env*", "*.config.*", "*.yml", "*.yaml", "*.ini", "*.sh" -File -ErrorAction SilentlyContinue |
        Where-Object { 
            $excludePath = $_.FullName
            $shouldExclude = $false
            foreach ($dir in $excludeDirs) {
                if ($excludePath -match [regex]::Escape($dir)) {
                    $shouldExclude = $true
                    break
                }
            }
            -not $shouldExclude
        }
    
    $foundSecrets = @()
    $fileCount = 0

    foreach ($file in $files) {
        $fileCount++
        try {
            $content = Get-Content $file.FullName -ErrorAction Stop -Encoding UTF8
        } catch {
            Write-Host "Warning: Skipped $($file.FullName) due to read error." -ForegroundColor Yellow
            continue
        }
        
        if ($content) {
            for ($i = 0; $i -lt $content.Length; $i++) {
                $line = $content[$i]
                # Skip comments (only process if $line is a string)
                if ($line -is [string] -and $line.TrimStart() -match '^(//|#|\*|/\*)') { continue }

                foreach ($patternItem in $patterns) {
                    if ($line -match $patternItem.Pattern) {
                        # Exclude common false positives
                        if ($line -match 'example|test|dummy|placeholder|TODO|FIXME') { continue }
                        if ($line -match 'password.*[:=]\s*(""|\x27\x27|null|undefined)') { continue }
                        
                        if ($line -is [string]) {
                            $lineContent = $line.Trim()
                            if ($lineContent.Length -gt 100) {
                                $lineContent = $lineContent.Substring(0, 100)
                            }

                            $foundSecrets += [PSCustomObject]@{
                                File = $file.FullName
                                LineNumber = $i + 1
                                Content = $lineContent
                                Type = $patternItem.Type
                            }
                        }
                    }
                }
            }
        }
    }

    Write-Host "  Scanned $fileCount files" -ForegroundColor Gray

    if ($foundSecrets.Count -gt 0) {
        Write-Host "Found $($foundSecrets.Count) potential hardcoded secrets:" -ForegroundColor Red
        $foundSecrets | ForEach-Object {
            Write-Host "  File: $($_.File) (Line $($_.LineNumber))" -ForegroundColor Cyan
            Write-Host "    Type: $($_.Type)" -ForegroundColor Magenta
            Write-Host "    Content: $($_.Content)" -ForegroundColor Red
            Write-Host ""
        }
    } else {
        Write-Host "  [OK] No hardcoded secrets found." -ForegroundColor Green
    }
}

function Find-SecurityVulnerabilities {
    param([string]$Path)

    Write-Host "`n2. Scanning for common security vulnerabilities..." -ForegroundColor Yellow

    # Define vulnerability patterns
    $vulnPatterns = @()
    $vulnPatterns += @{Pattern='(?i)\beval\s*\('; Type='Code Injection - eval'}
    $vulnPatterns += @{Pattern='(?i)new\s+Function\s*\('; Type='Code Injection - Function constructor'}
    $vulnPatterns += @{Pattern='(?i)innerHTML\s*='; Type='DOM-based XSS - innerHTML'}
    $vulnPatterns += @{Pattern='(?i)outerHTML\s*='; Type='DOM-based XSS - outerHTML'}
    $vulnPatterns += @{Pattern='(?i)document\.write\s*\('; Type='DOM-based XSS - document.write'}
    $vulnPatterns += @{Pattern='(?i)document\.writeln\s*\('; Type='DOM-based XSS - document.writeln'}
    $vulnPatterns += @{Pattern='(?i)dangerouslySetInnerHTML'; Type='React XSS Risk'}
    $vulnPatterns += @{Pattern='(?i)setInterval\s*\(\s*["\x27]'; Type='Code Injection - setInterval with string'}
    $vulnPatterns += @{Pattern='(?i)setTimeout\s*\(\s*["\x27]'; Type='Code Injection - setTimeout with string'}
    $vulnPatterns += @{Pattern='(?i)\bexec\s*\('; Type='Command Injection - exec'}
    $vulnPatterns += @{Pattern='(?i)\bexecSync\s*\('; Type='Command Injection - execSync'}
    $vulnPatterns += @{Pattern='(?i)\bspawn\s*\('; Type='Command Injection - spawn'}
    $vulnPatterns += @{Pattern='(?i)\bspawnSync\s*\('; Type='Command Injection - spawnSync'}
    $vulnPatterns += @{Pattern='(?i)execFile\s*\('; Type='Command Injection - execFile'}
    $vulnPatterns += @{Pattern='(?i)\.pipe\s*\(\s*process\.stdin'; Type='Input Injection'}
    $vulnPatterns += @{Pattern='(?i)fs\.readFileSync\s*\([^)]*req\.'; Type='Path Traversal Risk'}
    $vulnPatterns += @{Pattern='(?i)Math\.random\s*\(\)'; Type='Weak Random Number Generation'}
    $vulnPatterns += @{Pattern='(?i)crypto\.pseudoRandomBytes'; Type='Weak Cryptography'}
    $vulnPatterns += @{Pattern='(?i)md5|sha1(?!256)'; Type='Weak Hash Algorithm'}

    $excludeDirs = @('node_modules', '.git', 'dist', 'build', 'coverage', '.next', 'out', 'test', 'tests', '__tests__')
    $files = Get-ChildItem -Path $Path -Recurse -Include "*.ts", "*.tsx", "*.js", "*.jsx" -File -ErrorAction SilentlyContinue |
        Where-Object { 
            $excludePath = $_.FullName
            $shouldExclude = $false
            foreach ($dir in $excludeDirs) {
                if ($excludePath -match [regex]::Escape($dir)) {
                    $shouldExclude = $true
                    break
                }
            }
            -not $shouldExclude
        }
    
    $vulnerabilities = @()
    $fileCount = 0

    foreach ($file in $files) {
        $fileCount++
        try {
            $content = Get-Content $file.FullName -ErrorAction Stop -Encoding UTF8
        } catch {
            Write-Host "Warning: Skipped $($file.FullName) due to read error." -ForegroundColor Yellow
            continue
        }
        
        if ($content) {
            for ($i = 0; $i -lt $content.Length; $i++) {
                $line = $content[$i]
                # Skip comments (only process if $line is a string)
                if ($line -is [string] -and $line.TrimStart() -match '^(//|#|\*|/\*)') { continue }

                foreach ($patternItem in $vulnPatterns) {
                    if ($line -match $patternItem.Pattern) {
                        if ($line -is [string]) {
                            $lineContent = $line.Trim()
                            if ($lineContent.Length -gt 100) {
                                $lineContent = $lineContent.Substring(0, 100)
                            }

                            $vulnerabilities += [PSCustomObject]@{
                                File = $file.FullName
                                LineNumber = $i + 1
                                Content = $lineContent
                                VulnerabilityType = $patternItem.Type
                            }
                        }
                    }
                }
            }
        }
    }

    Write-Host "  Scanned $fileCount files" -ForegroundColor Gray

    if ($vulnerabilities.Count -gt 0) {
        Write-Host "Found $($vulnerabilities.Count) potential security vulnerabilities:" -ForegroundColor Red
        $vulnerabilities | Group-Object VulnerabilityType | ForEach-Object {
            Write-Host "`n  [$($_.Name)] - $($_.Count) occurrences" -ForegroundColor Magenta
            $_.Group | ForEach-Object {
                Write-Host "    File: $($_.File) (Line $($_.LineNumber))" -ForegroundColor Cyan
                Write-Host "      Content: $($_.Content)" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "  [OK] No common security vulnerabilities found." -ForegroundColor Green
    }
}

function Find-UnusedImports {
    param([string]$Path)

    Write-Host "`n3. Scanning for potentially unused imports..." -ForegroundColor Yellow
    Write-Host "  Note: This is a heuristic check. Use ESLint for accurate results." -ForegroundColor Gray

    $excludeDirs = @('node_modules', '.git', 'dist', 'build', 'coverage', '.next', 'out')
    $files = Get-ChildItem -Path $Path -Recurse -Include "*.ts", "*.tsx", "*.js", "*.jsx" -File -ErrorAction SilentlyContinue |
        Where-Object { 
            $excludePath = $_.FullName
            $shouldExclude = $false
            foreach ($dir in $excludeDirs) {
                if ($excludePath -match [regex]::Escape($dir)) {
                    $shouldExclude = $true
                    break
                }
            }
            -not $shouldExclude
        }
    
    $unusedImports = @()
    $fileCount = 0

    foreach ($file in $files) {
        $fileCount++
        try {
            $content = Get-Content $file.FullName -ErrorAction Stop -Encoding UTF8 -Raw
        } catch {
            Write-Host "Warning: Skipped $($file.FullName) due to read error." -ForegroundColor Yellow
            continue
        }
        
        if ($content) {
            $lines = $content -split "`n"
            for ($i = 0; $i -lt $lines.Length; $i++) {
                $line = $lines[$i]
                
                # Match named imports
                if ($line -match 'import\s*\{([^\}]+)\}\s*from') {
                    $importBlock = $matches[1]
                    $imports = $importBlock -split ',' | ForEach-Object { 
                        ($_ -replace '\s*as\s+.*', '').Trim() 
                    }
                    
                    foreach ($imp in $imports) {
                        if ($imp -and $imp -ne '') {
                            # Remove any type imports
                            $cleanImport = $imp -replace '^type\s+', ''
                            # Check if import is used anywhere else in the file
                            $pattern = "\b$([regex]::Escape($cleanImport))\b"
                            $restOfFile = $lines[($i+1)..($lines.Length-1)] -join "`n"
                            
                            if ($restOfFile -notmatch $pattern) {
                                $unusedImports += [PSCustomObject]@{
                                    File = $file.FullName
                                    LineNumber = $i + 1
                                    Import = $cleanImport
                                    Content = $line.Trim()
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    Write-Host "  Scanned $fileCount files" -ForegroundColor Gray

    if ($unusedImports.Count -gt 0) {
        Write-Host "Found $($unusedImports.Count) potentially unused imports (requires manual verification):" -ForegroundColor Yellow
        $unusedImports | ForEach-Object {
            Write-Host "  File: $($_.File) (Line $($_.LineNumber))" -ForegroundColor Cyan
            Write-Host "    Import: $($_.Import)" -ForegroundColor Yellow
            Write-Host ""
        }
    } else {
        Write-Host "  [OK] No obvious unused imports found." -ForegroundColor Green
    }
}

function Run-ESLint {
    param([string]$Path)

    Write-Host "`n4. Running ESLint analysis..." -ForegroundColor Yellow

    # Check if ESLint is available
    $eslintPath = Get-Command "npx" -ErrorAction SilentlyContinue
    if (-not $eslintPath) {
        Write-Host "  [SKIP] npx not found. ESLint check skipped." -ForegroundColor Yellow
        return
    }

    try {
        $eslintOutput = & npx eslint $Path --ext .ts,.tsx,.js,.jsx --format json 2>&1 | Out-String
        
        if ($LASTEXITCODE -eq 0 -or $LASTEXITCODE -eq 1) {
            try {
                $eslintJson = $eslintOutput | ConvertFrom-Json
                $errors = 0
                $warnings = 0
                $files = 0

                foreach ($file in $eslintJson) {
                    if ($file.messages.Count -gt 0) { $files++ }
                    foreach ($message in $file.messages) {
                        if ($message.severity -eq 2) { $errors++ }
                        else { $warnings++ }
                    }
                }

                if ($errors -gt 0 -or $warnings -gt 0) {
                    $color = if ($errors -gt 0) { 'Red' } else { 'Yellow' }
                    Write-Host "  ESLint found $errors errors and $warnings warnings in $files files." -ForegroundColor $color

                    if ($ShowDetails) {
                        foreach ($file in $eslintJson) {
                            if ($file.messages.Count -gt 0) {
                                Write-Host "`n  File: $($file.filePath)" -ForegroundColor Cyan
                                foreach ($message in $file.messages) {
                                    $type = if ($message.severity -eq 2) { 'ERROR' } else { 'WARNING' }
                                    $color = if ($message.severity -eq 2) { 'Red' } else { 'Yellow' }
                                    Write-Host "    [$type] Line $($message.line):$($message.column) - $($message.message) ($($message.ruleId))" -ForegroundColor $color
                                }
                            }
                        }
                    } else {
                        Write-Host "  Run with -ShowDetails flag to see all issues." -ForegroundColor Gray
                    }
                } else {
                    Write-Host "  [OK] No issues found by ESLint." -ForegroundColor Green
                }
            } catch {
                Write-Host "  [WARN] Could not parse ESLint output." -ForegroundColor Yellow
            }
        } else {
            Write-Host "  [SKIP] ESLint is not installed or not configured. Install with: npm install -D eslint" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  [SKIP] ESLint check failed. Ensure ESLint is available." -ForegroundColor Yellow
    }
}

function Run-TypeScriptCheck {
    param([string]$Path)

    Write-Host "`n5. Running TypeScript type checking..." -ForegroundColor Yellow

    $tsConfigPath = Join-Path $Path "tsconfig.json"
    if (-not (Test-Path $tsConfigPath)) {
        Write-Host "  [SKIP] No tsconfig.json found, skipping TypeScript check." -ForegroundColor Yellow
        return
    }

    # Check if tsc is available
    $tscPath = Get-Command "npx" -ErrorAction SilentlyContinue
    if (-not $tscPath) {
        Write-Host "  [SKIP] npx not found. TypeScript check skipped." -ForegroundColor Yellow
        return
    }

    try {
        $tscOutput = & npx tsc --noEmit 2>&1
        if ($LASTEXITCODE -ne 0) {
            $errorLines = $tscOutput | Where-Object { $_ -match 'error TS' }
            $errorCount = ($errorLines | Measure-Object).Count
            
            Write-Host "  TypeScript found $errorCount compilation errors:" -ForegroundColor Red
            
            if ($ShowDetails) {
                $errorLines | ForEach-Object {
                    Write-Host "    $_" -ForegroundColor Red
                }
            } else {
                $errorLines | Select-Object -First 5 | ForEach-Object {
                    Write-Host "    $_" -ForegroundColor Red
                }
                if ($errorCount -gt 5) {
                    Write-Host "    ... and $($errorCount - 5) more errors. Use -ShowDetails to see all." -ForegroundColor Gray
                }
            }
        } else {
            Write-Host "  [OK] No TypeScript compilation errors found." -ForegroundColor Green
        }
    } catch {
        Write-Host "  [SKIP] TypeScript check failed. Install with: npm install -D typescript" -ForegroundColor Yellow
    }
}

function Check-DependencyVulnerabilities {
    Write-Host "`n6. Checking for known dependency vulnerabilities..." -ForegroundColor Yellow

    $hasPackageJson = Test-Path "package.json"
    if (-not $hasPackageJson) {
        Write-Host "  [SKIP] No package.json found." -ForegroundColor Yellow
        return
    }

    # Check for npm
    if (Test-Path "package-lock.json") {
        try {
            $auditOutput = & npm audit --json 2>$null | Out-String
            if ($LASTEXITCODE -le 4 -and $auditOutput) {
                $audit = $auditOutput | ConvertFrom-Json
                
                if ($audit.metadata -and $audit.metadata.vulnerabilities) {
                    $totalVulns = $audit.metadata.vulnerabilities.total
                    
                    if ($totalVulns -gt 0) {
                        Write-Host "  Found $totalVulns dependency vulnerabilities:" -ForegroundColor Red
                        
                        $vulnLevels = @('critical', 'high', 'moderate', 'low')
                        foreach ($level in $vulnLevels) {
                            $count = $audit.metadata.vulnerabilities.$level
                            if ($count -gt 0) {
                                $color = switch ($level) {
                                    'critical' { 'Red' }
                                    'high' { 'Red' }
                                    'moderate' { 'Yellow' }
                                    'low' { 'Gray' }
                                }
                                Write-Host "    $level`: $count" -ForegroundColor $color
                            }
                        }
                        Write-Host "`n  Run 'npm audit fix' to attempt automatic fixes." -ForegroundColor Cyan
                    } else {
                        Write-Host "  [OK] No dependency vulnerabilities found." -ForegroundColor Green
                    }
                } else {
                    Write-Host "  [OK] No dependency vulnerabilities found." -ForegroundColor Green
                }
            } else {
                Write-Host "  [WARN] npm audit failed or returned no data." -ForegroundColor Yellow
            }
        } catch {
            Write-Host "  [WARN] npm audit check failed." -ForegroundColor Yellow
        }
    }
    # Check for Yarn
    elseif (Test-Path "yarn.lock") {
        if (Get-Command "yarn" -ErrorAction SilentlyContinue) {
            Write-Host "  Yarn project detected. Run 'yarn audit' manually for detailed results." -ForegroundColor Cyan
        } else {
            Write-Host "  [SKIP] Yarn lock found but yarn CLI is not installed." -ForegroundColor Yellow
        }
    }
    # Check for pnpm
    elseif (Test-Path "pnpm-lock.yaml") {
        if (Get-Command "pnpm" -ErrorAction SilentlyContinue) {
            try {
                $auditOutput = & pnpm audit --json 2>$null | Out-String
                if ($LASTEXITCODE -le 4 -and $auditOutput) {
                    $audit = $auditOutput | ConvertFrom-Json
                    if ($audit.metadata -and $audit.metadata.vulnerabilities) {
                        $totalVulns = $audit.metadata.vulnerabilities.total
                        $color = if ($totalVulns -gt 0) { 'Red' } else { 'Green' }
                        Write-Host "  Found $totalVulns dependency vulnerabilities." -ForegroundColor $color
                    } else {
                        Write-Host "  [OK] No dependency vulnerabilities found." -ForegroundColor Green
                    }
                }
            } catch {
                Write-Host "  [WARN] pnpm audit check failed." -ForegroundColor Yellow
            }
        } else {
            Write-Host "  [SKIP] pnpm lock found but pnpm CLI is not installed." -ForegroundColor Yellow
        }
    } else {
        Write-Host "  [SKIP] No lock file found (package-lock.json, yarn.lock, or pnpm-lock.yaml)." -ForegroundColor Yellow
    }
}

# Main execution
try {
    if (-not (Test-Path $ProjectPath)) {
        Write-Host "Error: Project path '$ProjectPath' does not exist." -ForegroundColor Red
        exit 1
    }

    Push-Location $ProjectPath

    Find-HardcodedSecrets -Path $ProjectPath
    Find-SecurityVulnerabilities -Path $ProjectPath
    Find-UnusedImports -Path $ProjectPath
    Run-ESLint -Path $ProjectPath
    Run-TypeScriptCheck -Path $ProjectPath
    Check-DependencyVulnerabilities

    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "Scan completed!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "`nNote: This script provides basic static analysis." -ForegroundColor White
    Write-Host "For comprehensive security analysis, consider:" -ForegroundColor White
    Write-Host "  • SonarQube - Code quality & security" -ForegroundColor Gray
    Write-Host "  • Snyk - Dependency vulnerability scanning" -ForegroundColor Gray
    Write-Host "  • CodeQL - Advanced static analysis" -ForegroundColor Gray
    Write-Host "  • ESLint plugins - eslint-plugin-security" -ForegroundColor Gray

} catch {
    Write-Host "`nError: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} finally {
    Pop-Location
}