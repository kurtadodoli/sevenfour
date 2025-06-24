# PowerShell script to start the server
Write-Host "🚀 Starting Seven Four Clothing Server..." -ForegroundColor Green
Write-Host ""

# Check if Node.js is available
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js." -ForegroundColor Red
    exit 1
}

# Navigate to server directory
Set-Location "c:\sevenfour\server"
Write-Host "📁 Changed to server directory: $(Get-Location)" -ForegroundColor Cyan

# Check dependencies
if (!(Test-Path "node_modules")) {
    Write-Host "📦 Installing server dependencies..." -ForegroundColor Yellow
    npm install
}

# Start the server
Write-Host ""
Write-Host "🌐 Starting server on port 3005..." -ForegroundColor Green
Write-Host "Frontend should connect to: http://localhost:3005" -ForegroundColor Cyan
Write-Host ""

# Use npm start instead of direct node command
npm start

Write-Host ""
Write-Host "Server stopped." -ForegroundColor Yellow
Read-Host "Press Enter to exit"
