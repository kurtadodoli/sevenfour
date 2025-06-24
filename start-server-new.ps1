# PowerShell script to start the Seven Four server
Write-Host "🚀 Starting Seven Four Clothing Server..." -ForegroundColor Green
Write-Host ""

# Set location to project directory
Set-Location "c:\sevenfour"
Write-Host "📁 Current directory: $(Get-Location)" -ForegroundColor Yellow

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if server directory exists
if (Test-Path "server\app.js") {
    Write-Host "✅ Server files found" -ForegroundColor Green
} else {
    Write-Host "❌ Server files not found" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "🔄 Starting server..." -ForegroundColor Cyan
Write-Host "Server will start on http://localhost:5000" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the server
try {
    npm run server
} catch {
    Write-Host "❌ Failed to start server with npm" -ForegroundColor Red
    Write-Host "Trying alternative method..." -ForegroundColor Yellow
    node server\app.js
}
