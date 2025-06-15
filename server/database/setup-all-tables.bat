@echo off
echo Creating all database tables...
mysql -u root -p seven_four_clothing < database/product_schema.sql
mysql -u root -p seven_four_clothing < database/cart_schema.sql
echo Database setup complete!
pause
