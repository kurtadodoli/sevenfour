@echo off
title Seven Four - Original Server
echo =======================================
echo   Seven Four Clothing - Original Server
echo =======================================
echo.
echo This starts the original server with all features
echo Server will run on: http://localhost:3005
echo Frontend will connect to: http://localhost:3005
echo.

REM Kill any existing node processes
taskkill /f /im node.exe >nul 2>&1

REM Navigate to server directory
cd /d "c:\sevenfour\server"
echo Current directory: %CD%
echo.

REM Check if dependencies exist
if not exist "node_modules" (
    echo Installing server dependencies...
    npm install
    echo.
)

echo Starting server...
echo.
npm start

echo.
echo Server stopped or failed to start.
echo Check the error messages above.
pause
