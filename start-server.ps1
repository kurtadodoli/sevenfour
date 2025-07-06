# PowerShell script to start the server
Write-Host "=== Starting Seven Four Clothing Server ===" -ForegroundColor Green

# Kill any existing node processes
Write-Host "Stopping any running Node.js processes..." -ForegroundColor Yellow
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue

# Wait a moment
Start-Sleep -Seconds 2

# Change to server directory and start
Write-Host "Starting server..." -ForegroundColor Yellow
Set-Location "c:\sfc\server"
node app.js
