@echo off
echo ============================================
echo   EMERGENCY ORDER FIX - RESTARTING SERVER
echo ============================================
echo.

echo Step 1: Stopping any running Node.js processes...
taskkill /f /im node.exe 2>nul
echo.

echo Step 2: Freeing up port 5000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000') do taskkill /f /pid %%a 2>nul
echo.

echo Step 3: Starting server with fixed code...
cd /d c:\sfc\server
echo Starting server in 3 seconds...
timeout /t 3 /nobreak >nul

echo.
echo Server starting... (Press Ctrl+C to stop)
echo.
npm start

echo.
echo If the server failed to start, try:
echo 1. cd c:\sfc\server
echo 2. npm start
echo.
pause
