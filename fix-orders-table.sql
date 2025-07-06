-- SQL script to fix the orders table customer_fullname issue
-- Run this in MySQL Workbench or command line

USE seven_four_clothing;

-- Check current table structure
DESCRIBE orders;

-- Add customer_fullname column if it doesn't exist
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_fullname VARCHAR(255) NULL DEFAULT 'Guest Customer';

-- If the above doesn't work (MySQL version doesn't support IF NOT EXISTS), try:
-- ALTER TABLE orders ADD COLUMN customer_fullname VARCHAR(255) NULL DEFAULT 'Guest Customer';

-- Update any existing orders that don't have customer_fullname
UPDATE orders SET customer_fullname = COALESCE(customer_fullname, 'Guest Customer') WHERE customer_fullname IS NULL OR customer_fullname = '';

-- Verify the fix
DESCRIBE orders;
SELECT COUNT(*) as total_orders, COUNT(customer_fullname) as with_customer_fullname FROM orders;
