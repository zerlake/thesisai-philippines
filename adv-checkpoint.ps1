# adv-checkpoint.ps1
param(
  [Parameter(Position=0, Mandatory=$true)]
  [ValidateSet("save", "restore", "list", "cleanup")]
  [string]$Action,
  [string]$Tag # Optional tag for naming the checkpoint
)

$checkpointsRoot = ".checkpoints"
if (-Not (Test-Path $checkpointsRoot)) { New-Item -ItemType Directory -Path $checkpointsRoot | Out-Null }

function Get-Timestamp {
    return (Get-Date -Format "yyyyMMdd-HHmmss")
}

function Save-Checkpoint {
    $timestamp = Get-Timestamp
    $suffix = if ($Tag) { "$timestamp-$Tag" } else { $timestamp }
    $checkpointDir = Join-Path $checkpointsRoot $suffix
    Write-Host "Saving checkpoint $checkpointDir ..."
    New-Item -ItemType Directory -Path $checkpointDir | Out-Null

    # Exclude some folders and logs
    Get-ChildItem -Path . -Recurse -Force |
        Where-Object {
            $_.FullName -notmatch "\\($checkpointsRoot|node_modules|\\.next|dist|\\.git)(\\|$)" -and $_.Name -notlike "*.log"
        } | Copy-Item -Destination { Join-Path $checkpointDir $_.FullName.Substring((Get-Location).Path.Length+1) } -Force
    Write-Host "Checkpoint saved as $suffix"
}

function List-Checkpoints {
    Write-Host "Available checkpoints:"
    Get-ChildItem -Path $checkpointsRoot | ForEach-Object { Write-Host "  $" }
}

function Restore-Checkpoint {
    List-Checkpoints
    $folder = if ($Tag) { $Tag } else { Read-Host "Enter checkpoint name to restore" }
    $checkpointDir = Join-Path $checkpointsRoot $folder
    if (-Not (Test-Path $checkpointDir)) {
        Write-Host "Checkpoint $folder does not exist."
        return
    }
    Write-Host "Auto-backup current state before restore (y/n)?"
    $createBackup = Read-Host
    if ($createBackup -match '^y') {
        Save-Checkpoint -Tag "autoBackupBeforeRestore"
    }
    # Remove everything except excluded folders
    Get-ChildItem -Path . -Exclude $checkpointsRoot, "node_modules", ".next", "dist", ".git" -Force | Remove-Item -Recurse -Force
    Copy-Item "$checkpointDir\*" . -Recurse -Force
    Write-Host "Restored from checkpoint $folder."
}

function Cleanup-Checkpoints {
    Write-Host "Are you sure you want to delete all checkpoints? (y/n)"
    $confirm = Read-Host
    if ($confirm -match '^y') {
        Remove-Item $checkpointsRoot -Recurse -Force
        Write-Host "All checkpoints deleted."
    } else {
        Write-Host "Cleanup cancelled."
    }
}

switch ($Action) {
    "save" { Save-Checkpoint }
    "list" { List-Checkpoints }
    "restore" { Restore-Checkpoint }
    "cleanup" { Cleanup-Checkpoints }
}
