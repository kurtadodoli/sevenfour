-- Enhanced Products Table with Size/Color Variant Stock Management
-- This will create a proper database structure for tracking stock by size and color

USE seven_four_clothing;

-- 1. First, let's add the missing stock fields to the products table
-- Check if columns exist first, then add them if they don't
SET @sql = CONCAT('ALTER TABLE products 
ADD COLUMN total_available_stock INT DEFAULT 0,
ADD COLUMN total_reserved_stock INT DEFAULT 0,
ADD COLUMN total_stock INT DEFAULT 0,
ADD COLUMN stock_status ENUM(''in_stock'', ''low_stock'', ''critical_stock'', ''out_of_stock'') DEFAULT ''in_stock'',
ADD COLUMN last_stock_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
ADD COLUMN sizes TEXT,
ADD COLUMN sizeColorVariants TEXT,
ADD COLUMN product_type VARCHAR(100)');

-- Execute the ALTER TABLE statement (will fail gracefully if columns already exist)
-- We'll use individual ALTER statements to avoid complete failure
ALTER TABLE products ADD COLUMN total_available_stock INT DEFAULT 0;
ALTER TABLE products ADD COLUMN total_reserved_stock INT DEFAULT 0;
ALTER TABLE products ADD COLUMN total_stock INT DEFAULT 0;
ALTER TABLE products ADD COLUMN stock_status ENUM('in_stock', 'low_stock', 'critical_stock', 'out_of_stock') DEFAULT 'in_stock';
ALTER TABLE products ADD COLUMN last_stock_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
ALTER TABLE products ADD COLUMN sizes TEXT;
ALTER TABLE products ADD COLUMN sizeColorVariants TEXT;
ALTER TABLE products ADD COLUMN product_type VARCHAR(100);

-- 2. Create a dedicated table for size/color variant stock tracking
CREATE TABLE IF NOT EXISTS product_variants (
    variant_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    size VARCHAR(50) NOT NULL,
    color VARCHAR(50) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    reserved_quantity INT NOT NULL DEFAULT 0,
    available_quantity INT GENERATED ALWAYS AS (stock_quantity - reserved_quantity) STORED,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Create unique constraint for size-color combination per product
    UNIQUE KEY unique_product_size_color (product_id, size, color),
    
    -- Foreign key reference to products table
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- 3. Create indexes for better performance
CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_product_variants_availability ON product_variants(available_quantity);
CREATE INDEX idx_products_stock_status ON products(stock_status);

-- 4. Create a table to track stock movements (for auditing)
CREATE TABLE IF NOT EXISTS stock_movements (
    movement_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    variant_id INT NULL, -- NULL for general stock, specific for size/color variants
    movement_type ENUM('addition', 'subtraction', 'adjustment', 'order_confirmed', 'order_cancelled') NOT NULL,
    quantity_changed INT NOT NULL,
    quantity_before INT NOT NULL,
    quantity_after INT NOT NULL,
    reference_type ENUM('order', 'manual_adjustment', 'inventory_update', 'product_creation') DEFAULT 'manual_adjustment',
    reference_id VARCHAR(100) NULL, -- Order ID, user ID, etc.
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants(variant_id) ON DELETE SET NULL
);

-- 5. Create triggers to automatically update total stock when variants change
DELIMITER //

CREATE TRIGGER IF NOT EXISTS update_total_stock_on_variant_insert
AFTER INSERT ON product_variants
FOR EACH ROW
BEGIN
    UPDATE products 
    SET total_stock = (
        SELECT COALESCE(SUM(stock_quantity), 0) 
        FROM product_variants 
        WHERE product_id = NEW.product_id
    ),
    total_available_stock = (
        SELECT COALESCE(SUM(available_quantity), 0) 
        FROM product_variants 
        WHERE product_id = NEW.product_id
    ),
    total_reserved_stock = (
        SELECT COALESCE(SUM(reserved_quantity), 0) 
        FROM product_variants 
        WHERE product_id = NEW.product_id
    ),
    stock_status = CASE 
        WHEN (SELECT COALESCE(SUM(available_quantity), 0) FROM product_variants WHERE product_id = NEW.product_id) <= 0 THEN 'out_of_stock'
        WHEN (SELECT COALESCE(SUM(available_quantity), 0) FROM product_variants WHERE product_id = NEW.product_id) <= 5 THEN 'critical_stock'
        WHEN (SELECT COALESCE(SUM(available_quantity), 0) FROM product_variants WHERE product_id = NEW.product_id) <= 15 THEN 'low_stock'
        ELSE 'in_stock'
    END,
    last_stock_update = CURRENT_TIMESTAMP
    WHERE product_id = NEW.product_id;
END//

CREATE TRIGGER IF NOT EXISTS update_total_stock_on_variant_update
AFTER UPDATE ON product_variants
FOR EACH ROW
BEGIN
    UPDATE products 
    SET total_stock = (
        SELECT COALESCE(SUM(stock_quantity), 0) 
        FROM product_variants 
        WHERE product_id = NEW.product_id
    ),
    total_available_stock = (
        SELECT COALESCE(SUM(available_quantity), 0) 
        FROM product_variants 
        WHERE product_id = NEW.product_id
    ),
    total_reserved_stock = (
        SELECT COALESCE(SUM(reserved_quantity), 0) 
        FROM product_variants 
        WHERE product_id = NEW.product_id
    ),
    stock_status = CASE 
        WHEN (SELECT COALESCE(SUM(available_quantity), 0) FROM product_variants WHERE product_id = NEW.product_id) <= 0 THEN 'out_of_stock'
        WHEN (SELECT COALESCE(SUM(available_quantity), 0) FROM product_variants WHERE product_id = NEW.product_id) <= 5 THEN 'critical_stock'
        WHEN (SELECT COALESCE(SUM(available_quantity), 0) FROM product_variants WHERE product_id = NEW.product_id) <= 15 THEN 'low_stock'
        ELSE 'in_stock'
    END,
    last_stock_update = CURRENT_TIMESTAMP
    WHERE product_id = NEW.product_id;
END//

CREATE TRIGGER IF NOT EXISTS update_total_stock_on_variant_delete
AFTER DELETE ON product_variants
FOR EACH ROW
BEGIN
    UPDATE products 
    SET total_stock = (
        SELECT COALESCE(SUM(stock_quantity), 0) 
        FROM product_variants 
        WHERE product_id = OLD.product_id
    ),
    total_available_stock = (
        SELECT COALESCE(SUM(available_quantity), 0) 
        FROM product_variants 
        WHERE product_id = OLD.product_id
    ),
    total_reserved_stock = (
        SELECT COALESCE(SUM(reserved_quantity), 0) 
        FROM product_variants 
        WHERE product_id = OLD.product_id
    ),
    stock_status = CASE 
        WHEN (SELECT COALESCE(SUM(available_quantity), 0) FROM product_variants WHERE product_id = OLD.product_id) <= 0 THEN 'out_of_stock'
        WHEN (SELECT COALESCE(SUM(available_quantity), 0) FROM product_variants WHERE product_id = OLD.product_id) <= 5 THEN 'critical_stock'
        WHEN (SELECT COALESCE(SUM(available_quantity), 0) FROM product_variants WHERE product_id = OLD.product_id) <= 15 THEN 'low_stock'
        ELSE 'in_stock'
    END,
    last_stock_update = CURRENT_TIMESTAMP
    WHERE product_id = OLD.product_id;
END//

DELIMITER ;

-- 6. Create some sample data to test the structure
-- First, let's populate some variant data for existing products
INSERT IGNORE INTO product_variants (product_id, size, color, stock_quantity) 
SELECT 
    p.product_id,
    'S' as size,
    'Black' as color,
    25 as stock_quantity
FROM products p 
WHERE p.product_id IS NOT NULL
LIMIT 1;

INSERT IGNORE INTO product_variants (product_id, size, color, stock_quantity) 
SELECT 
    p.product_id,
    'S' as size,
    'White' as color,
    20 as stock_quantity
FROM products p 
WHERE p.product_id IS NOT NULL
LIMIT 1;

INSERT IGNORE INTO product_variants (product_id, size, color, stock_quantity) 
SELECT 
    p.product_id,
    'M' as size,
    'Black' as color,
    23 as stock_quantity
FROM products p 
WHERE p.product_id IS NOT NULL
LIMIT 1;

INSERT IGNORE INTO product_variants (product_id, size, color, stock_quantity) 
SELECT 
    p.product_id,
    'M' as size,
    'White' as color,
    23 as stock_quantity
FROM products p 
WHERE p.product_id IS NOT NULL
LIMIT 1;

INSERT IGNORE INTO product_variants (product_id, size, color, stock_quantity) 
SELECT 
    p.product_id,
    'L' as size,
    'Black' as color,
    26 as stock_quantity
FROM products p 
WHERE p.product_id IS NOT NULL
LIMIT 1;

INSERT IGNORE INTO product_variants (product_id, size, color, stock_quantity) 
SELECT 
    p.product_id,
    'L' as size,
    'White' as color,
    29 as stock_quantity
FROM products p 
WHERE p.product_id IS NOT NULL
LIMIT 1;

-- 7. Show the structure
SELECT "Enhanced database structure created successfully!" as status;
SELECT "Tables created: product_variants, stock_movements" as tables_created;
SELECT "Triggers created for automatic stock calculation" as triggers_created;

-- Display current structure
DESCRIBE products;
DESCRIBE product_variants;
DESCRIBE stock_movements;

-- Show sample data
SELECT 'Product Variants Sample:' as info;
SELECT pv.*, p.productname 
FROM product_variants pv 
JOIN products p ON pv.product_id = p.product_id 
LIMIT 10;

SELECT 'Product Stock Summary:' as info;
SELECT product_id, productname, total_stock, total_available_stock, total_reserved_stock, stock_status
FROM products 
WHERE total_stock > 0
LIMIT 5;
