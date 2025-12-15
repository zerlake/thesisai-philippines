@echo off
setlocal enabledelayedexpansion

color 0B
echo.
echo ========================================
echo   CI/CD Deployment Script
echo ========================================
echo.

REM Check if we're in a git repository
if not exist ".git" (
    color 04
    echo [ERROR] Not in a git repository!
    echo Please run this script from the project root directory.
    pause
    exit /b 1
)

color 0B
echo [INFO] Current directory: %CD%
echo [INFO] Checking git status...
echo.

REM Stage all CI/CD files
echo [STEP 1] Staging workflow files...
git add .github\workflows\ 2>nul
git add lighthouse-ci-config.json 2>nul
echo [STEP 2] Staging documentation...
git add CI_CD_*.md 2>nul
git add CI_CD_*.txt 2>nul
git add SETUP_COMPLETE_CI_CD.txt 2>nul
git add deploy-cicd.ps1 2>nul
echo [STEP 3] Staging AGENTS.md...
git add AGENTS.md 2>nul
echo.

REM Show status
echo [INFO] Staged files:
git diff --cached --name-only
echo.

REM Create commit
echo [STEP 4] Creating commit...
git commit -m "ci: add GitHub Actions CI/CD pipeline"

if errorlevel 1 (
    echo [WARNING] No new changes to commit or commit failed
) else (
    echo [SUCCESS] Commit created!
)
echo.

REM Push to GitHub
echo [STEP 5] Pushing to GitHub...
git push origin main

if errorlevel 1 (
    color 04
    echo [ERROR] Push failed!
    echo Please check your network connection and try again.
    pause
    exit /b 1
)

color 0A
echo.
echo ========================================
echo   DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo [INFO] Next Steps:
echo.
echo 1. Monitor Workflows:
echo    https://github.com/zerlake/thesisai-philippines/actions
echo.
echo 2. First run: 30-45 minutes
echo.
echo 3. Check for:
echo    * All 7 workflows execute
echo    * Tests pass
echo    * Coverage generates
echo    * Performance metrics collected
echo.
echo [INFO] Documentation:
echo    * CI_CD_INDEX.md (navigation)
echo    * CI_CD_QUICK_REFERENCE.md (quick start)
echo    * CI_CD_SETUP_GUIDE.md (full guide)
echo.
pause
