@echo off
REM Initialize the product database tables

echo Initializing product database...

REM Connect to MySQL and run the schema file
mysql -u root -p < product_schema.sql

echo Database initialization complete!
pause
