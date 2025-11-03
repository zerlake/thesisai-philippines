# PowerShell script to set GEMINI_API_KEY environment variable and verify it

param(
    [Parameter(Mandatory=$true)]
    [string]$ApiKey
)

# Set GEMINI_API_KEY for current user persistently
Write-Host "Setting GEMINI_API_KEY environment variable..."
setx GEMINI_API_KEY $ApiKey | Out-Null

# Reload environment variables for current session
$env:GEMINI_API_KEY = $ApiKey

# Verify the variable is set
if ($env:GEMINI_API_KEY -eq $ApiKey) {
    Write-Host "GEMINI_API_KEY successfully set."
} else {
    Write-Warning "Failed to set GEMINI_API_KEY."
}

# Optional: Run Gemini CLI command
# Uncomment and set your command below
# gemini your-command-here
# Example:
# gemini help
