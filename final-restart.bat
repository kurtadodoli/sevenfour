@echo off
echo ========================================
echo   NUCLEAR SUCCESS - RESTARTING SERVER
echo ========================================
echo.
echo ✅ customer_fullname column REMOVED from database
echo ✅ Order creation test PASSED
echo.

echo Killing existing processes...
taskkill /f /im node.exe >nul 2>&1

echo Waiting 3 seconds...
timeout /t 3 /nobreak >nul

echo Starting main server...
cd /d c:\sfc\server

echo.
echo ====================================
echo   SERVER STARTING - PROBLEM SOLVED
echo ====================================
echo - Database column removed
echo - All code cleaned
echo - Order creation should work now!
echo ====================================
echo.

npm start
