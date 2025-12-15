# Organize TXT and JSON files
# TXT: All files to docs/reports-logs/
# JSON: Only report/data files to docs/reports-logs/ (config files stay in root)

# Create logs/reports folder
$logsFolder = "docs/reports-logs"
if (-Not (Test-Path $logsFolder)) {
    New-Item -ItemType Directory -Path $logsFolder -Force | Out-Null
    Write-Host "Created: $logsFolder"
}

# Config files that MUST stay in root
$configJsonFiles = @(
    "package.json",
    "tsconfig.json",
    ".eslintrc.json",
    "components.json",
    "mcp-servers-config.json",
    "amp.json"
)

$txtMoveCount = 0
$jsonMoveCount = 0
$jsonKeepCount = 0

# Move TXT files
Write-Host "`n=== Moving TXT Files ===" -ForegroundColor Green
Get-ChildItem -Path "c:\Users\Projects\thesis-ai-fresh" -Depth 0 -Filter "*.txt" -File | ForEach-Object {
    $destPath = Join-Path $logsFolder $_.Name
    Move-Item -Path $_.FullName -Destination $destPath -Force -ErrorAction SilentlyContinue
    Write-Host "→ $($_.Name) → $logsFolder"
    $txtMoveCount++
}

# Move JSON files (except config)
Write-Host "`n=== Processing JSON Files ===" -ForegroundColor Green
Get-ChildItem -Path "c:\Users\Projects\thesis-ai-fresh" -Depth 0 -Filter "*.json" -File | ForEach-Object {
    if ($_.Name -in $configJsonFiles) {
        Write-Host "KEEP: $($_.Name) (config file)"
        $jsonKeepCount++
    }
    else {
        $destPath = Join-Path $logsFolder $_.Name
        Move-Item -Path $_.FullName -Destination $destPath -Force -ErrorAction SilentlyContinue
        Write-Host "→ $($_.Name) → $logsFolder"
        $jsonMoveCount++
    }
}

Write-Host "`n=== Summary ===" -ForegroundColor Green
Write-Host "TXT files moved: $txtMoveCount"
Write-Host "JSON files moved: $jsonMoveCount"
Write-Host "JSON files kept in root: $jsonKeepCount"

# Verify
$txtRemaining = (Get-ChildItem -Path "c:\Users\Projects\thesis-ai-fresh" -Depth 0 -Filter "*.txt" -File | Measure-Object).Count
$jsonInRoot = (Get-ChildItem -Path "c:\Users\Projects\thesis-ai-fresh" -Depth 0 -Filter "*.json" -File | Measure-Object).Count
$filesInLogs = (Get-ChildItem -Path $logsFolder -File | Measure-Object).Count

Write-Host "`nVerification:"
Write-Host "TXT files remaining in root: $txtRemaining (should be 0)"
Write-Host "JSON files in root: $jsonInRoot (should be $($configJsonFiles.Count))"
Write-Host "Files in docs/reports-logs/: $filesInLogs"
