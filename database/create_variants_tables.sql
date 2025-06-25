-- Create product variants table and stock movement tracking
USE seven_four_clothing;

-- Create a dedicated table for size/color variant stock tracking
CREATE TABLE IF NOT EXISTS product_variants (
    variant_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    size VARCHAR(50) NOT NULL,
    color VARCHAR(50) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    reserved_quantity INT NOT NULL DEFAULT 0,
    available_quantity INT NOT NULL DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Create unique constraint for size-color combination per product
    UNIQUE KEY unique_product_size_color (product_id, size, color),
    
    -- Foreign key reference to products table
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_product_variants_availability ON product_variants(available_quantity);
CREATE INDEX idx_products_stock_status ON products(stock_status);

-- Create a table to track stock movements (for auditing)
CREATE TABLE IF NOT EXISTS stock_movements (
    movement_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    variant_id INT NULL, -- NULL for general stock, specific for size/color variants
    movement_type ENUM('addition', 'subtraction', 'adjustment', 'order_confirmed', 'order_cancelled') NOT NULL,
    quantity_changed INT NOT NULL,
    quantity_before INT NOT NULL,
    quantity_after INT NOT NULL,
    size VARCHAR(50) NULL,
    color VARCHAR(50) NULL,
    reference_type ENUM('order', 'manual_adjustment', 'inventory_update', 'product_creation') DEFAULT 'manual_adjustment',
    reference_id VARCHAR(100) NULL, -- Order ID, user ID, etc.
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants(variant_id) ON DELETE SET NULL
);

-- Show the structure
SELECT "Product variants tables created successfully!" as status;

-- Display structure
DESCRIBE product_variants;
DESCRIBE stock_movements;
