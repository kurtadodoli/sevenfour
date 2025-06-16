-- Option 1: Create table only if it doesn't exist
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT UNIQUE NOT NULL,
    productname VARCHAR(255) NOT NULL,
    productdescription TEXT,
    productprice DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    productcolor VARCHAR(100),
    
    -- Size and stock information (stored as JSON for flexibility)
    sizes_data JSON,
    total_stock INT DEFAULT 0,
    
    -- Product status and metadata
    productstatus ENUM('active', 'inactive', 'archived') DEFAULT 'active',
    
    -- 10 separate image columns for individual image management
    image1 VARCHAR(500) NULL,
    image2 VARCHAR(500) NULL,
    image3 VARCHAR(500) NULL,
    image4 VARCHAR(500) NULL,
    image5 VARCHAR(500) NULL,
    image6 VARCHAR(500) NULL,
    image7 VARCHAR(500) NULL,
    image8 VARCHAR(500) NULL,
    image9 VARCHAR(500) NULL,
    image10 VARCHAR(500) NULL,
    
    -- Primary image (first uploaded image)
    primary_image VARCHAR(500) NULL,
    
    -- Image metadata
    total_images INT DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for better performance
    INDEX idx_product_id (product_id),
    INDEX idx_status (productstatus),
    INDEX idx_created_at (created_at)
);

-- Option 2: Drop and recreate (uncomment if you want to replace existing table)
-- DROP TABLE IF EXISTS products;
-- CREATE TABLE products (
--     ... same structure as above ...
-- );
