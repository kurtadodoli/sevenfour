@echo off
title Seven Four Clothing Server
cd /d "c:\sevenfour"
echo.
echo ========================================
echo   Seven Four Clothing Server Starting
echo ========================================
echo.
echo Server will start on http://localhost:3001
echo.
echo Press Ctrl+C to stop the server
echo.
node working-server.js
echo.
echo Server stopped. Press any key to exit...
pause > nul
