@echo off
echo =====================================
echo   MySQL Database Connection Test
echo =====================================
echo.

echo Checking if MySQL is accessible...
echo.

rem Try to connect to MySQL and show any error messages
mysql -u root -ps3v3n-f0ur-cl0thing* -e "USE seven_four_clothing; DESCRIBE orders;" 2>&1

if %errorlevel% equ 0 (
    echo.
    echo ✅ MySQL connection successful!
    echo.
    echo Now running database fix...
    echo.
    mysql -u root -ps3v3n-f0ur-cl0thing* -e "USE seven_four_clothing; ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_fullname VARCHAR(255) NULL DEFAULT 'Guest Customer'; DESCRIBE orders;" 2>&1
    
    if %errorlevel% equ 0 (
        echo.
        echo ✅ Database fix completed successfully!
        echo.
        echo Now you can restart your server and test order creation.
    ) else (
        echo.
        echo ❌ Database fix failed. The column might already exist.
        echo Trying alternative approach...
        echo.
        mysql -u root -ps3v3n-f0ur-cl0thing* -e "USE seven_four_clothing; ALTER TABLE orders MODIFY COLUMN customer_fullname VARCHAR(255) NULL DEFAULT 'Guest Customer';" 2>&1
    )
) else (
    echo.
    echo ❌ Cannot connect to MySQL.
    echo.
    echo Possible solutions:
    echo 1. Start MySQL service: net start mysql
    echo 2. Check if MySQL is installed
    echo 3. Verify credentials in server/.env
    echo.
    echo Trying to start MySQL service...
    echo.
    net start mysql
    echo.
    net start mysql80
    echo.
)

echo.
echo Press any key to continue...
pause >nul
