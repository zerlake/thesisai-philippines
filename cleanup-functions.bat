@echo off
REM Phase 5 Cleanup: Remove 25 unused Supabase functions
REM Generated: November 28, 2025

setlocal enabledelayedexpansion

cd /d "%~dp0"

echo Cleaning up unused Supabase functions...
echo.

REM Batch 1: Generation Functions
if exist "supabase\functions\generate-abstract" rmdir /s /q "supabase\functions\generate-abstract" && echo [OK] generate-abstract
if exist "supabase\functions\generate-citation" rmdir /s /q "supabase\functions\generate-citation" && echo [OK] generate-citation
if exist "supabase\functions\generate-citation-from-source" rmdir /s /q "supabase\functions\generate-citation-from-source" && echo [OK] generate-citation-from-source
if exist "supabase\functions\generate-conclusion" rmdir /s /q "supabase\functions\generate-conclusion" && echo [OK] generate-conclusion
if exist "supabase\functions\generate-defense-questions" rmdir /s /q "supabase\functions\generate-defense-questions" && echo [OK] generate-defense-questions
if exist "supabase\functions\generate-feedback" rmdir /s /q "supabase\functions\generate-feedback" && echo [OK] generate-feedback
if exist "supabase\functions\generate-flashcards" rmdir /s /q "supabase\functions\generate-flashcards" && echo [OK] generate-flashcards
if exist "supabase\functions\generate-outline" rmdir /s /q "supabase\functions\generate-outline" && echo [OK] generate-outline

REM Batch 2: Presentation & Survey
if exist "supabase\functions\generate-presentation" rmdir /s /q "supabase\functions\generate-presentation" && echo [OK] generate-presentation
if exist "supabase\functions\generate-presentation-slides" rmdir /s /q "supabase\functions\generate-presentation-slides" && echo [OK] generate-presentation-slides
if exist "supabase\functions\generate-survey-questions" rmdir /s /q "supabase\functions\generate-survey-questions" && echo [OK] generate-survey-questions
if exist "supabase\functions\generate-titles" rmdir /s /q "supabase\functions\generate-titles" && echo [OK] generate-titles

REM Batch 3: Research & Analysis
if exist "supabase\functions\check-originality" rmdir /s /q "supabase\functions\check-originality" && echo [OK] check-originality
if exist "supabase\functions\check-internal-plagiarism" rmdir /s /q "supabase\functions\check-internal-plagiarism" && echo [OK] check-internal-plagiarism
if exist "supabase\functions\interpret-results" rmdir /s /q "supabase\functions\interpret-results" && echo [OK] interpret-results
if exist "supabase\functions\search-google-scholar" rmdir /s /q "supabase\functions\search-google-scholar" && echo [OK] search-google-scholar
if exist "supabase\functions\search-web" rmdir /s /q "supabase\functions\search-web" && echo [OK] search-web
if exist "supabase\functions\synthesize-literature" rmdir /s /q "supabase\functions\synthesize-literature" && echo [OK] synthesize-literature

REM Batch 4: Misc Functions
if exist "supabase\functions\ensure-demo-user" rmdir /s /q "supabase\functions\ensure-demo-user" && echo [OK] ensure-demo-user
if exist "supabase\functions\get-serpapi-status" rmdir /s /q "supabase\functions\get-serpapi-status" && echo [OK] get-serpapi-status
if exist "supabase\functions\call-arxiv-mcp-server" rmdir /s /q "supabase\functions\call-arxiv-mcp-server" && echo [OK] call-arxiv-mcp-server

REM Batch 5: Legacy AI Functions
if exist "supabase\functions\grammar-check" rmdir /s /q "supabase\functions\grammar-check" && echo [OK] grammar-check
if exist "supabase\functions\paraphrase-text" rmdir /s /q "supabase\functions\paraphrase-text" && echo [OK] paraphrase-text

REM Batch 6: Data Processing
if exist "supabase\functions\pdf-analyzer" rmdir /s /q "supabase\functions\pdf-analyzer" && echo [OK] pdf-analyzer

echo.
echo Cleanup complete! 25 unused functions removed.
echo.
echo Active functions remaining:
dir /B "supabase\functions" | findstr /V "^_shared$"
echo.
echo Next: pnpm build && pnpm test && pnpm lint
