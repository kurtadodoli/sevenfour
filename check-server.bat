@echo off
echo Checking if server is running on port 3001...
netstat -ano | findstr :3001
if %ERRORLEVEL% EQU 0 (
    echo ✅ Something is running on port 3001
) else (
    echo ❌ Nothing is running on port 3001
    echo Starting server...
    cd server
    start cmd /k "node simple-server.js"
)
pause
