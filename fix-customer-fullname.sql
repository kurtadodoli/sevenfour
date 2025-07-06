-- Quick fix for customer_fullname field to allow order creation
-- This adds a default value so orders can be created immediately

USE seven_four_clothing;

-- Make customer_fullname nullable with a default value
ALTER TABLE orders 
MODIFY customer_fullname VARCHAR(255) DEFAULT 'Customer';

-- Verify the change
DESCRIBE orders;
