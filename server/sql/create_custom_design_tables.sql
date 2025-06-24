-- Create Custom Design Database Tables
USE seven_four_clothing;

-- Drop existing tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS custom_design_images;
DROP TABLE IF EXISTS custom_designs;

-- Create custom_designs table
CREATE TABLE IF NOT EXISTS custom_designs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    design_id VARCHAR(50) UNIQUE NOT NULL,
    user_id BIGINT NULL,
    
    -- Product Information
    product_type ENUM('t-shirts', 'shorts', 'hoodies', 'jackets', 'sweaters', 'jerseys') NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_color VARCHAR(50) NOT NULL,
    product_size ENUM('XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL') NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    additional_info TEXT,
    
    -- Customer Information
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20),
    
    -- Metro Manila Shipping Details
    street_address VARCHAR(500) NOT NULL,
    city ENUM(
        'Caloocan', 'Las Piñas', 'Makati', 'Malabon', 'Mandaluyong', 'Manila', 
        'Marikina', 'Muntinlupa', 'Navotas', 'Parañaque', 'Pasay', 'Pasig', 
        'Pateros', 'Quezon City', 'San Juan', 'Taguig', 'Valenzuela'
    ) NOT NULL,
    house_number VARCHAR(100),
    barangay VARCHAR(100),
    postal_code VARCHAR(10),
    
    -- Order Management
    status ENUM('pending', 'under_review', 'approved', 'in_production', 'ready_for_pickup', 'completed', 'cancelled') DEFAULT 'pending',
    estimated_price DECIMAL(10, 2) DEFAULT 0.00,
    final_price DECIMAL(10, 2) DEFAULT 0.00,
    admin_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints (user_id can be NULL for guest orders)
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    
    -- Indexes for better performance
    INDEX idx_design_id (design_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_product_type (product_type),
    INDEX idx_created_at (created_at),
    INDEX idx_customer_email (customer_email)
);

-- Create custom_design_images table to store uploaded design images
CREATE TABLE IF NOT EXISTS custom_design_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    design_id VARCHAR(50) NOT NULL,
    image_filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    image_path VARCHAR(500) NOT NULL,
    image_url VARCHAR(500),
    image_size INT,
    mime_type VARCHAR(50),
    upload_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    FOREIGN KEY (design_id) REFERENCES custom_designs(design_id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_design_id (design_id),
    INDEX idx_upload_order (upload_order)
);

-- Insert sample data for reference
INSERT INTO custom_designs (
    design_id, user_id, product_type, product_name, product_color, product_size, quantity,
    customer_name, customer_email, customer_phone, street_address, city, house_number, 
    barangay, postal_code, additional_info, status, estimated_price
) VALUES 
(
    'DESIGN-001', NULL, 't-shirts', 'Custom Logo T-Shirt', 'black', 'L', 2,
    'Juan Dela Cruz', 'juan@example.com', '09123456789', '123 Rizal Street', 'Manila', 
    'Unit 4B', 'Ermita', '1000', 'Print logo on front, small logo on back', 'pending', 800.00
);
