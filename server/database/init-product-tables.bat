@echo off
REM Initialize Product Database Tables
REM This script ensures all product-related tables exist and are populated with default data

echo Initializing product database...

REM Run the product schema script
mysql -u root -p seven_four_clothing < product_schema.sql

echo Product database initialization complete!
echo Product tables created:
echo - products
echo - product_variants  
echo - product_sizes
echo - product_colors
echo - product_images
echo - product_audit_log
echo - product_categories
echo.
echo Default categories added:
echo - T-Shirts
echo - Hoodies
echo - Shorts
echo - Jackets
echo - Accessories

pause
