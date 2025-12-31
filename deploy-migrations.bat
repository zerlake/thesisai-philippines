@echo off
echo Deploying ThesisAI referral system migrations...

cd /d "C:\Users\Projects\thesis-ai-fresh"

echo Linking to Supabase project...
supabase link --project-ref dnyjgzzfyzrsucucexhy

if %ERRORLEVEL% NEQ 0 (
    echo Error occurred during linking. Please make sure Supabase CLI is installed and you are authenticated.
    pause
    exit /b %ERRORLEVEL%
)

echo Pushing database migrations...
supabase db push

if %ERRORLEVEL% NEQ 0 (
    echo Error occurred during database push. Please check the error messages above.
    pause
    exit /b %ERRORLEVEL%
)

echo Deploying edge functions...
supabase functions deploy referral-alerts

if %ERRORLEVEL% NEQ 0 (
    echo Error occurred during function deployment. Please check the error messages above.
    pause
    exit /b %ERRORLEVEL%
)

echo Deployment completed successfully!
pause