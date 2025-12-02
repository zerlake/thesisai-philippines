@echo off
REM Start ArXiv MCP Server
REM This script sets up and runs the MCP server

cls
echo.
echo ════════════════════════════════════════════════════════════════════
echo              ArXiv MCP Server Startup Script
echo ════════════════════════════════════════════════════════════════════
echo.

REM Get current directory
cd /d "%~dp0"
echo Current directory: %cd%
echo.

REM Check if virtual environment exists
if exist ".venv" (
    echo [OK] Virtual environment found
) else (
    echo [INFO] Creating virtual environment...
    echo.
    call uv venv
    echo.
)

REM Activate virtual environment
echo Activating virtual environment...
call .venv\Scripts\activate.bat
if errorlevel 1 (
    echo [ERROR] Failed to activate virtual environment
    pause
    exit /b 1
)
echo [OK] Virtual environment activated
echo.

REM Install dependencies
echo [INFO] Checking and installing dependencies...
echo Running: uv pip install -e ".[test]"
echo.
call uv pip install -e ".[test]"
echo.

REM Start the server
cls
echo.
echo ════════════════════════════════════════════════════════════════════
echo              Starting ArXiv MCP Server
echo ════════════════════════════════════════════════════════════════════
echo.
echo Starting server on port 3001...
echo URL: http://localhost:3001
echo Docs: http://localhost:3001/docs
echo Health: http://localhost:3001/health
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the server
python -m arxiv_mcp_server --port 3001

pause
