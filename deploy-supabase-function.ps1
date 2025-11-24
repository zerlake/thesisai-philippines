# Deploy Supabase Function - Generate Topic Ideas
Write-Host "Deploying Supabase function: generate-topic-ideas" -ForegroundColor Green

# Check if Supabase CLI is installed
try {
    supabase --version | Out-Null
} catch {
    Write-Host "Installing Supabase CLI..." -ForegroundColor Yellow
    npm install -g supabase
}

# Deploy the function
Write-Host "Deploying function..." -ForegroundColor Cyan
supabase functions deploy generate-topic-ideas

if ($LASTEXITCODE -eq 0) {
    Write-Host "Function deployed successfully!" -ForegroundColor Green
} else {
    Write-Host "Deployment failed. Run: supabase functions deploy generate-topic-ideas" -ForegroundColor Red
}
