@echo off
title Seven Four Server - Working!
echo ========================================
echo   Seven Four Clothing Server - WORKING!
echo ========================================
echo.
echo Checking Node.js...
node --version
echo.
echo This starts the full server with all features:
echo - Custom orders API
echo - Database connection  
echo - Authentication
echo - File uploads
echo.
echo Server will run on: http://localhost:3001
echo Frontend connects to: http://localhost:3001
echo.
echo Killing any conflicting processes...
taskkill /f /im node.exe >nul 2>&1
echo.
cd /d "c:\sevenfour\server"
echo Current directory: %CD%
echo.
echo Checking server dependencies...
if not exist "node_modules" (
    echo Installing server dependencies...
    npm install
)
echo.
echo Starting server...
echo.
npm start
echo.
echo Server stopped or failed to start.
pause
