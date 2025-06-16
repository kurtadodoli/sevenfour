-- Update database schema to support multiple images per product
USE seven_four_clothing;

-- Create product_images table for multiple images
CREATE TABLE IF NOT EXISTS product_images (
    image_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    image_filename VARCHAR(255) NOT NULL,
    image_order INT NOT NULL DEFAULT 0,
    is_thumbnail BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_product_id (product_id),
    INDEX idx_thumbnail (is_thumbnail)
);

-- Add sizes as a JSON column for multiple sizes with stock per size (MySQL 5.7+)
-- Check if columns exist before adding them
SET @column_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'seven_four_clothing' 
    AND TABLE_NAME = 'products' 
    AND COLUMN_NAME = 'sizes'
);

-- Add sizes column if it doesn't exist
SET @sql = IF(@column_exists = 0, 
    'ALTER TABLE products ADD COLUMN sizes TEXT;', 
    'SELECT "Column sizes already exists";'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add total_stock column
SET @column_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'seven_four_clothing' 
    AND TABLE_NAME = 'products' 
    AND COLUMN_NAME = 'total_stock'
);

SET @sql = IF(@column_exists = 0, 
    'ALTER TABLE products ADD COLUMN total_stock INT DEFAULT 0;', 
    'SELECT "Column total_stock already exists";'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update existing products to use the new structure
UPDATE products SET total_stock = productquantity WHERE total_stock = 0;
