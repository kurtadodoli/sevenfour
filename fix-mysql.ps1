# PowerShell script to fix MySQL database
Write-Host "🔧 MySQL Database Fix Script" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan

# Function to test MySQL connection
function Test-MySQLConnection {
    Write-Host "`n🔍 Testing MySQL connection..." -ForegroundColor Yellow
    
    try {
        # Try to connect using mysql command
        $result = & mysql -u root -ps3v3n-f0ur-cl0thing* -e "SELECT 1 as test;" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ MySQL connection successful" -ForegroundColor Green
            return $true
        } else {
            Write-Host "❌ MySQL connection failed: $result" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ MySQL command not found or failed: $_" -ForegroundColor Red
        return $false
    }
}

# Function to start MySQL service
function Start-MySQLService {
    Write-Host "`n🚀 Attempting to start MySQL service..." -ForegroundColor Yellow
    
    $services = @("mysql", "mysql80", "mysql57", "MySQL80", "MySQL")
    
    foreach ($service in $services) {
        try {
            $serviceObj = Get-Service -Name $service -ErrorAction SilentlyContinue
            if ($serviceObj) {
                Write-Host "Found service: $service (Status: $($serviceObj.Status))" -ForegroundColor Blue
                if ($serviceObj.Status -ne "Running") {
                    Start-Service -Name $service
                    Write-Host "✅ Started $service service" -ForegroundColor Green
                    return $true
                } else {
                    Write-Host "✅ $service service is already running" -ForegroundColor Green
                    return $true
                }
            }
        } catch {
            Write-Host "⚠️ Could not start $service : $_" -ForegroundColor Yellow
        }
    }
    
    Write-Host "❌ Could not find or start any MySQL service" -ForegroundColor Red
    return $false
}

# Function to run database fix using Node.js
function Fix-DatabaseSchema {
    Write-Host "`n🔧 Running database schema fix..." -ForegroundColor Yellow
    
    try {
        $result = & node fix-db-now.js
        Write-Host $result -ForegroundColor White
        Write-Host "✅ Database fix script completed" -ForegroundColor Green
    } catch {
        Write-Host "❌ Database fix script failed: $_" -ForegroundColor Red
    }
}

# Main execution
Write-Host "`nStep 1: Starting MySQL service..." -ForegroundColor Cyan
$serviceStarted = Start-MySQLService

Write-Host "`nStep 2: Testing connection..." -ForegroundColor Cyan
$connectionOk = Test-MySQLConnection

if ($connectionOk) {
    Write-Host "`nStep 3: Fixing database schema..." -ForegroundColor Cyan
    Fix-DatabaseSchema
} else {
    Write-Host "`n❌ Cannot proceed without MySQL connection" -ForegroundColor Red
    Write-Host "`n💡 Manual steps:" -ForegroundColor Yellow
    Write-Host "1. Install MySQL or XAMPP" -ForegroundColor White
    Write-Host "2. Start MySQL service" -ForegroundColor White
    Write-Host "3. Run this script again" -ForegroundColor White
}

Write-Host "`n🎯 Next steps after database fix:" -ForegroundColor Cyan
Write-Host "1. cd server" -ForegroundColor White
Write-Host "2. npm start" -ForegroundColor White
Write-Host "3. Test order creation in browser" -ForegroundColor White

Write-Host "`n✨ Script completed!" -ForegroundColor Green
