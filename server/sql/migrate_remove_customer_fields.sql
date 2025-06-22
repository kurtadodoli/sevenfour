-- Migration: Remove redundant customer fields from custom_orders table
USE seven_four_clothing;

-- Drop columns (will show warnings if they don't exist, but won't fail)
ALTER TABLE custom_orders DROP COLUMN customer_name;
ALTER TABLE custom_orders DROP COLUMN customer_email;
