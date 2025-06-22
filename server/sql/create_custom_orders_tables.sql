-- Create Custom Orders Database Tables
USE seven_four_clothing;

-- Drop existing tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS custom_order_communications;
DROP TABLE IF EXISTS custom_order_status_history;
DROP TABLE IF EXISTS custom_order_images;
DROP TABLE IF EXISTS custom_orders;

-- Create custom_orders table
CREATE TABLE IF NOT EXISTS custom_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    custom_order_id VARCHAR(50) UNIQUE NOT NULL,
    user_id BIGINT NOT NULL,
    product_type ENUM('t-shirts', 'shorts', 'hoodies', 'jackets', 'sweaters', 'jerseys') NOT NULL,
      -- Product customization details
    size VARCHAR(10) NOT NULL,
    color VARCHAR(50) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    urgency ENUM('standard', 'express', 'rush') DEFAULT 'standard',    special_instructions TEXT,
    
    -- Customer contact (only phone needed - name/email from user table)
    customer_phone VARCHAR(20),
    
    -- Shipping address
    province VARCHAR(100) NOT NULL,
    municipality VARCHAR(100) NOT NULL,
    street_number VARCHAR(255) NOT NULL,
    house_number VARCHAR(100),
    barangay VARCHAR(100),
    postal_code VARCHAR(20),
    
    -- Order status and tracking
    status ENUM('pending', 'under_review', 'approved', 'in_production', 'quality_check', 'ready_for_shipping', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    estimated_price DECIMAL(10, 2) DEFAULT 0.00,
    final_price DECIMAL(10, 2) DEFAULT 0.00,
    payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
    payment_method ENUM('cash_on_delivery', 'online_payment') DEFAULT 'cash_on_delivery',
    
    -- Admin notes and updates
    admin_notes TEXT,
    production_notes TEXT,
    estimated_delivery_date DATE,
    actual_delivery_date DATE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
      -- Indexes for better performance
    INDEX idx_custom_order_id (custom_order_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_product_type (product_type),
    INDEX idx_created_at (created_at)
);

-- Create custom_order_images table to store uploaded design images
CREATE TABLE IF NOT EXISTS custom_order_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    custom_order_id VARCHAR(50) NOT NULL,
    image_filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    image_path VARCHAR(500) NOT NULL,
    image_url VARCHAR(500),
    image_size INT, -- Size in bytes
    mime_type VARCHAR(50),
    upload_order INT DEFAULT 0, -- Order of images (for main image, etc.)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    FOREIGN KEY (custom_order_id) REFERENCES custom_orders(custom_order_id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_custom_order_id (custom_order_id),
    INDEX idx_upload_order (upload_order)
);

-- Create custom_order_status_history table to track status changes
CREATE TABLE IF NOT EXISTS custom_order_status_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    custom_order_id VARCHAR(50) NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by BIGINT, -- user_id of who made the change
    change_reason TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    FOREIGN KEY (custom_order_id) REFERENCES custom_orders(custom_order_id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(user_id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_custom_order_id (custom_order_id),
    INDEX idx_created_at (created_at)
);

-- Create custom_order_communications table for messages between customer and admin
CREATE TABLE IF NOT EXISTS custom_order_communications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    custom_order_id VARCHAR(50) NOT NULL,
    sender_id BIGINT NOT NULL,
    sender_type ENUM('customer', 'admin', 'system') NOT NULL,
    message TEXT NOT NULL,
    attachment_path VARCHAR(500),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    FOREIGN KEY (custom_order_id) REFERENCES custom_orders(custom_order_id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_custom_order_id (custom_order_id),
    INDEX idx_sender_id (sender_id),
    INDEX idx_created_at (created_at),
    INDEX idx_is_read (is_read)
);

-- Create a view for easier querying of custom orders with user information
CREATE OR REPLACE VIEW custom_orders_with_user AS
SELECT 
    co.*,
    u.first_name,
    u.last_name,
    CONCAT(u.first_name, ' ', u.last_name) as customer_name,
    u.email as customer_email,
    COUNT(coi.id) as image_count
FROM custom_orders co
LEFT JOIN users u ON co.user_id = u.user_id
LEFT JOIN custom_order_images coi ON co.custom_order_id = coi.custom_order_id
GROUP BY co.id, u.user_id;

-- Insert some sample custom order statuses for reference
INSERT IGNORE INTO custom_order_status_history (custom_order_id, old_status, new_status, changed_by, change_reason, notes) VALUES
('SAMPLE001', NULL, 'pending', 'ADMIN000001', 'Order created', 'Sample status entry for reference');
