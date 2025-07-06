@echo off
echo ================================
echo RESTARTING SEVEN FOUR CLOTHING SERVER
echo ================================

echo.
echo Stopping any existing server processes...
taskkill /f /im node.exe >nul 2>&1

echo.
echo Starting the server...
cd /d "c:\sfc\server"
echo Current directory: %CD%
echo.

start "Seven Four Clothing Server" cmd /k "node server.js"

echo.
echo ================================
echo Server restart initiated!
echo ================================
echo.
echo The server should now be running with the customer_fullname fix.
echo You can now try placing an order again.
echo.
pause
