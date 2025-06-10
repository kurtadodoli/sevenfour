-- Drop database if exists and create new one
DROP DATABASE IF EXISTS seven_four_clothing;
CREATE DATABASE seven_four_clothing;
USE seven_four_clothing;

-- Products related tables
-- Drop tables if they exist
DROP TABLE IF EXISTS delivery_schedules;
DROP TABLE IF EXISTS inventory;
DROP TABLE IF EXISTS product_sizes;
DROP TABLE IF EXISTS product_colors;
DROP TABLE IF EXISTS product_images;
DROP TABLE IF EXISTS products;

-- Create products table
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_archived BOOLEAN DEFAULT FALSE,
    INDEX idx_category (category),
    INDEX idx_archived (is_archived)
);

-- Create product_images table
CREATE TABLE product_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product_images (product_id)
);

-- Create product_colors table
CREATE TABLE product_colors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    color VARCHAR(50) NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_product_color (product_id, color),
    INDEX idx_product_colors (product_id)
);

-- Create product_sizes table
CREATE TABLE product_sizes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    size VARCHAR(10) NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_product_size (product_id, size),
    INDEX idx_product_sizes (product_id)
);

-- Create inventory table
CREATE TABLE inventory (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    color_id INT NOT NULL,
    size_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    critical_level INT NOT NULL DEFAULT 5,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (color_id) REFERENCES product_colors(id) ON DELETE CASCADE,
    FOREIGN KEY (size_id) REFERENCES product_sizes(id) ON DELETE CASCADE,
    UNIQUE KEY unique_product_color_size (product_id, color_id, size_id),
    INDEX idx_inventory_product (product_id)
);

-- Create delivery_schedules table
CREATE TABLE delivery_schedules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    estimated_days INT NOT NULL DEFAULT 3,
    shipping_cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    available_regions JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_delivery_product (product_id)
);

-- Create users table with proper constraints and types
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    gender ENUM('male', 'female', 'other') NOT NULL,
    birthday DATE NOT NULL,
    role ENUM('customer', 'admin', 'staff') DEFAULT 'customer',
    profile_picture_url VARCHAR(255),
    street_address VARCHAR(255),
    apartment_suite VARCHAR(50),
    city VARCHAR(100),
    state_province VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    reset_code VARCHAR(6) NULL,
    reset_code_expiry TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE KEY unique_email (email),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create default admin user
INSERT INTO users (
    first_name,
    last_name,
    email,
    password,
    gender,
    birthday,
    role
) VALUES (
    'Admin',
    'User',
    'admin@sevenfour.com',
    '$2b$10$PKFUVWJpS8fwpt9xbxEJNelL6jYIOzWfRFcB9C.YO0sXu5W2Id5MS',
    'other',
    '1990-01-01',
    'admin'
);