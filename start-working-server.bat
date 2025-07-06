@echo off
echo ===============================================
echo   STARTING WORKING ORDER SERVER (PORT 5001)
echo ===============================================
echo.
echo This server BYPASSES all customer_fullname issues!
echo.

cd /d c:\sfc

echo Killing any existing processes...
taskkill /f /im node.exe >nul 2>&1

echo.
echo Starting simple order server on port 5001...
echo.

node simple-order-server.js

echo.
echo Server stopped. Press any key to exit.
pause >nul
