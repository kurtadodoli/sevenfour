-- Complete Custom Orders Database Structure for CustomPage.js
-- This creates all necessary tables to store form data from the CustomPage.js component

USE seven_four_clothing;

-- =====================================================
-- 1. CREATE CUSTOM ORDERS TABLE
-- =====================================================
-- Stores all main order information from CustomPage.js
CREATE TABLE IF NOT EXISTS custom_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    custom_order_id VARCHAR(50) UNIQUE NOT NULL,
    user_id BIGINT NULL,
    
    -- Product Information (from Step 1 & 3)
    product_type ENUM('t-shirts', 'shorts', 'hoodies', 'jackets', 'sweaters', 'jerseys') NOT NULL,
    product_name VARCHAR(255) NULL,  -- Custom product name from form
    size ENUM('XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL') NOT NULL,
    color VARCHAR(50) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    urgency ENUM('standard', 'express', 'rush') DEFAULT 'standard',
    special_instructions TEXT NULL,
    
    -- Customer Information (from Step 4)
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NULL,
    
    -- Shipping Address (from Step 5) - Metro Manila (NCR) only
    province VARCHAR(50) DEFAULT 'Metro Manila',
    municipality ENUM(
        'Caloocan', 'Las Piñas', 'Makati', 'Malabon', 'Mandaluyong', 'Manila', 
        'Marikina', 'Muntinlupa', 'Navotas', 'Parañaque', 'Pasay', 'Pasig', 
        'Pateros', 'Quezon City', 'San Juan', 'Taguig', 'Valenzuela'
    ) NOT NULL,
    street_number VARCHAR(500) NOT NULL,  -- Complete street address
    house_number VARCHAR(100) NULL,       -- Unit/House number
    barangay VARCHAR(100) NULL,           -- Barangay
    postal_code VARCHAR(10) NULL,         -- Postal code
    
    -- Pricing and Status
    estimated_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    final_price DECIMAL(10, 2) NULL,
    status ENUM('pending', 'under_review', 'approved', 'in_production', 'ready_for_delivery', 'completed', 'cancelled') DEFAULT 'pending',
    admin_notes TEXT NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    
    -- Indexes for performance
    INDEX idx_custom_order_id (custom_order_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_product_type (product_type),
    INDEX idx_customer_email (customer_email),
    INDEX idx_created_at (created_at),
    INDEX idx_municipality (municipality)
);

-- =====================================================
-- 2. CREATE CUSTOM ORDER IMAGES TABLE
-- =====================================================
-- Stores all uploaded design images (from Step 2)
CREATE TABLE IF NOT EXISTS custom_order_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    custom_order_id VARCHAR(50) NOT NULL,  -- Links to custom_orders.custom_order_id
    image_filename VARCHAR(255) NOT NULL,   -- Generated filename on server
    original_filename VARCHAR(255) NOT NULL, -- Original filename from user
    image_path VARCHAR(500) NOT NULL,       -- Full file path on server
    image_url VARCHAR(500) NULL,            -- Public URL (if applicable)
    image_size INT NULL,                    -- File size in bytes
    mime_type VARCHAR(50) NULL,             -- Image MIME type
    upload_order INT DEFAULT 0,             -- Order of upload (1-10)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    FOREIGN KEY (custom_order_id) REFERENCES custom_orders(custom_order_id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_custom_order_id (custom_order_id),
    INDEX idx_upload_order (upload_order),
    INDEX idx_created_at (created_at)
);

-- =====================================================
-- 3. CREATE ORDER STATUS HISTORY TABLE (Optional)
-- =====================================================
-- Tracks status changes for admin/customer transparency
CREATE TABLE IF NOT EXISTS custom_order_status_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    custom_order_id VARCHAR(50) NOT NULL,
    old_status VARCHAR(50) NULL,
    new_status VARCHAR(50) NOT NULL,
    changed_by VARCHAR(255) NULL,  -- Admin username or system
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (custom_order_id) REFERENCES custom_orders(custom_order_id) ON DELETE CASCADE,
    INDEX idx_custom_order_id (custom_order_id),
    INDEX idx_created_at (created_at)
);

-- =====================================================
-- 4. ADD SAMPLE DATA FOR TESTING
-- =====================================================
-- Insert sample data to verify structure
INSERT INTO custom_orders (
    custom_order_id, user_id, product_type, product_name, size, color, quantity,
    special_instructions, customer_name, customer_email, customer_phone,
    province, municipality, street_number, house_number, barangay, postal_code,
    estimated_price, status
) VALUES (
    'CUSTOM-TEST-001', 
    NULL,  -- Guest order
    't-shirts', 
    'My Custom Logo Shirt', 
    'L', 
    'Black', 
    2,
    'Please print logo on front center and small logo on back',
    'Juan Dela Cruz',
    'juan@example.com',
    '09123456789',
    'Metro Manila',
    'Manila',
    '123 Rizal Street, Binondo',
    'Unit 4B',
    'Ermita',
    '1000',
    2100.00,  -- 2 x 1050 = 2100
    'pending'
) ON DUPLICATE KEY UPDATE id=id;  -- Prevent duplicate insertion

-- =====================================================
-- 5. CREATE VIEWS FOR EASY DATA ACCESS
-- =====================================================
-- View to get complete order information with image count
CREATE OR REPLACE VIEW custom_orders_summary AS
SELECT 
    co.id,
    co.custom_order_id,
    co.user_id,
    co.product_type,
    co.product_name,
    co.size,
    co.color,
    co.quantity,
    co.customer_name,
    co.customer_email,
    co.customer_phone,
    co.municipality,
    co.street_number,
    co.estimated_price,
    co.status,
    co.created_at,
    COUNT(coi.id) as image_count
FROM custom_orders co
LEFT JOIN custom_order_images coi ON co.custom_order_id = coi.custom_order_id
GROUP BY co.id
ORDER BY co.created_at DESC;

-- =====================================================
-- 6. SHOW TABLE STRUCTURES
-- =====================================================
SHOW TABLES LIKE 'custom_%';
DESCRIBE custom_orders;
DESCRIBE custom_order_images;

-- =====================================================
-- 7. VERIFY DATA
-- =====================================================
SELECT 'Custom Orders Count:' as info, COUNT(*) as count FROM custom_orders
UNION ALL
SELECT 'Custom Order Images Count:' as info, COUNT(*) as count FROM custom_order_images;

-- Show sample data
SELECT * FROM custom_orders_summary LIMIT 5;
