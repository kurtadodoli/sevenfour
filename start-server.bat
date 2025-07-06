@echo off
echo ========================================
echo SEVEN FOUR CLOTHING - SERVER RESTART
echo ========================================

echo.
echo Step 1: Killing any existing Node.js processes...
taskkill /f /im node.exe >nul 2>&1
echo Done.

echo.
echo Step 2: Waiting 3 seconds...
timeout /t 3 >nul

echo.
echo Step 3: Checking if port 5000 is free...
netstat -ano | findstr :5000
if %errorlevel% equ 0 (
    echo Port 5000 is still in use. Trying to free it...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do taskkill /f /pid %%a >nul 2>&1
)

echo.
echo Step 4: Starting the server...
cd /d "c:\sfc\server"
echo Current directory: %CD%

echo.
echo Starting Node.js server...
node server.js
pause
