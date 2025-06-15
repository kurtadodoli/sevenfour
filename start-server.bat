@echo off
title Seven Four Server
echo Starting Seven Four Server...
echo.

echo Killing any existing processes on port 3001...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001 ^| findstr LISTENING') do (
    echo Killing process %%a...
    taskkill /F /PID %%a 2>nul
)

echo.
echo Starting server on port 3001...
echo Server will start in 3 seconds...
timeout /t 3

node simple-server.js
pause
