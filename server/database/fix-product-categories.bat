@echo off
echo Creating product_categories table...

REM Navigate to the correct directory
cd /d "%~dp0"

REM Run the SQL script
mysql -u root -p seven_four_clothing < fix-product-categories.sql

echo.
echo Product categories table setup complete!
echo You can now use the categories endpoint without errors.
pause
