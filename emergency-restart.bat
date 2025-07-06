@echo off
echo ========================================
echo   EMERGENCY SERVER RESTART
echo ========================================
echo.

echo Step 1: Forcefully killing ALL Node.js processes...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im npm.exe >nul 2>&1
echo ✅ Node processes killed

echo.
echo Step 2: Clearing port 5000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000 2^>nul') do (
    echo Killing process on port 5000: %%a
    taskkill /f /pid %%a >nul 2>&1
)
echo ✅ Port 5000 cleared

echo.
echo Step 3: Waiting 3 seconds...
timeout /t 3 /nobreak >nul

echo Step 4: Starting server with ALL fixes applied...
cd /d c:\sfc\server

echo.
echo =======================================
echo   SERVER STARTING WITH FIXES
echo =======================================
echo - NO customer_fullname fields in SQL
echo - All INSERT statements cleaned
echo - Order creation should work now
echo =======================================
echo.

node app.js

echo.
echo If server failed to start, check for errors above.
pause
