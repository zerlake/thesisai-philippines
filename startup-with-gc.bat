@echo off
echo Starting application with garbage collection and memory limits...
echo.

REM Start the application with GC exposed and memory limits
node --expose-gc --max-old-space-size=8192 --max-semi-space-size=512 next dev