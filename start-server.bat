@echo off
echo Starting Seven Four Clothing Server...
echo.

cd /d "c:\sevenfour"
echo Current directory: %cd%
echo.

echo Checking if node is installed...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    pause
    exit /b 1
)

echo.
echo Starting server...
npm run server

pause
