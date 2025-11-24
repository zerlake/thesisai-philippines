@echo off
REM Puter AI Paraphraser Integration Tests Runner (Windows)
REM This script runs the Puter connection and paraphrasing tests

setlocal enabledelayedexpansion

echo.
echo ==========================================
echo Puter AI Paraphraser Integration Tests
echo ==========================================
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Error: node_modules not found
    echo Please run: npm install
    pause
    exit /b 1
)

REM Check if vitest is available
npm list vitest > nul 2>&1
if errorlevel 1 (
    echo Error: vitest not installed
    echo Please run: npm install
    pause
    exit /b 1
)

echo Running Puter Paraphraser Integration Tests...
echo.

REM Run the integration test
call npm run test -- __tests__/integration/puter-paraphraser.integration.test.ts --run

if %errorlevel% equ 0 (
    echo.
    echo ✓ Integration tests passed!
    echo.
    echo Next steps:
    echo 1. Open manual test in browser:
    echo    File: __tests__/manual/puter-connection-test.html
    echo.
    echo 2. Or use the paraphrasing tool in the app:
    echo    Visit: /paraphraser page
    echo.
    pause
) else (
    echo.
    echo ✗ Integration tests failed
    echo.
    echo Troubleshooting:
    echo 1. Ensure Puter SDK is loaded in the application
    echo 2. Verify you are authenticated with Puter
    echo 3. Check browser console for error messages
    echo 4. Check internet connection
    echo.
    pause
    exit /b 1
)

endlocal
