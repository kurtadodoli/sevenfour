-- Enhance Custom Orders Table to include product_name field
-- This adds the product_name field that the CustomPage.js frontend sends

USE seven_four_clothing;

-- Add product_name field to store custom product names from the frontend
ALTER TABLE custom_orders 
ADD COLUMN product_name VARCHAR(255) NULL AFTER product_type;

-- Add index for better performance on product_name searches
ALTER TABLE custom_orders 
ADD INDEX idx_product_name (product_name);

-- Update any existing records to set product_name based on product_type
UPDATE custom_orders 
SET product_name = CASE 
    WHEN product_type = 't-shirts' THEN 'Custom T-Shirt'
    WHEN product_type = 'shorts' THEN 'Custom Shorts'
    WHEN product_type = 'hoodies' THEN 'Custom Hoodie'
    WHEN product_type = 'jackets' THEN 'Custom Jacket'
    WHEN product_type = 'sweaters' THEN 'Custom Sweater'
    WHEN product_type = 'jerseys' THEN 'Custom Jersey'
    ELSE CONCAT('Custom ', UPPER(SUBSTRING(product_type, 1, 1)), SUBSTRING(product_type, 2))
END
WHERE product_name IS NULL;

-- Show the updated table structure
DESCRIBE custom_orders;
