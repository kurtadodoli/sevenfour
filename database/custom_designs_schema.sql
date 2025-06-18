-- Custom Designs Database Schema
-- This script creates the necessary tables for the custom design system

-- Create custom_designs table
CREATE TABLE IF NOT EXISTS custom_designs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    design_id VARCHAR(50) UNIQUE NOT NULL,
    user_id BIGINT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_description TEXT,
    product_type ENUM('bags','hats','hoodies','jackets','jerseys','shorts','sweaters','t-shirts') NOT NULL,
    size VARCHAR(100),
    color VARCHAR(100),
    quantity INT DEFAULT 1,
    price DECIMAL(10,2) DEFAULT 0.00,
    
    -- Design specifications
    design_concept TEXT,
    special_requirements TEXT,
    notes TEXT,
    
    -- Images
    concept_image VARCHAR(255),
    reference_image1 VARCHAR(255),
    reference_image2 VARCHAR(255),
    reference_image3 VARCHAR(255),
    
    -- Status and approval
    status ENUM('pending', 'approved', 'rejected', 'completed') DEFAULT 'pending',
    admin_remarks TEXT,
    approved_by BIGINT NULL,
    approved_at TIMESTAMP NULL,
    rejected_by BIGINT NULL,
    rejected_at TIMESTAMP NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (rejected_by) REFERENCES users(user_id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Create custom_orders table for approved designs that become orders
CREATE TABLE IF NOT EXISTS custom_orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    design_id VARCHAR(50) NOT NULL,
    user_id BIGINT NOT NULL,
    
    -- Order details
    total_amount DECIMAL(10,2) NOT NULL,
    shipping_address TEXT NOT NULL,
    contact_phone VARCHAR(20),
    order_notes TEXT,
    
    -- Status
    order_status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    payment_method VARCHAR(50) DEFAULT 'COD',
    payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
    
    -- Timestamps
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (design_id) REFERENCES custom_designs(design_id) ON DELETE RESTRICT,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_user_id (user_id),
    INDEX idx_design_id (design_id),
    INDEX idx_order_status (order_status),
    INDEX idx_order_date (order_date)
);

-- Insert sample data (optional)
-- You can run this to test the system
/*
INSERT INTO custom_designs (
    design_id, user_id, product_name, product_description, product_type, 
    size, color, quantity, price, design_concept, special_requirements,
    concept_image, status
) VALUES 
('CD001', 967502321335174, 'Custom Hoodie Design', 'A unique hoodie with personal branding', 'hoodies', 
 'Large', 'Black', 1, 1500.00, 'Modern minimalist design with custom logo placement', 
 'High-quality fabric, embroidered logo', 'concept_design_001.jpg', 'pending'),
 
('CD002', 967502321335174, 'Custom T-Shirt Design', 'Personalized t-shirt with custom graphics', 't-shirts', 
 'Medium', 'White', 2, 800.00, 'Vintage-style design with retro colors', 
 'Soft cotton material, screen printing', 'concept_design_002.jpg', 'approved');
*/
