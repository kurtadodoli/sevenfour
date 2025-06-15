-- Create the products table for Seven Four Clothing
CREATE DATABASE IF NOT EXISTS seven_four_clothing;
USE seven_four_clothing;

-- Drop table if exists to recreate
DROP TABLE IF EXISTS products;

-- Create products table
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT UNIQUE NOT NULL,
    productname VARCHAR(255) NOT NULL,
    productimage VARCHAR(255),
    productdescription TEXT,
    productprice DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    productsize VARCHAR(50),
    productcolor VARCHAR(50),
    productquantity INT NOT NULL DEFAULT 0,
    productstatus ENUM('active', 'inactive', 'archived') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create archives table
CREATE TABLE IF NOT EXISTS product_archives (
    archive_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    archiveddate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unarchiveddate TIMESTAMP NULL,
    archived_by VARCHAR(100),
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- Create backups table
CREATE TABLE IF NOT EXISTS data_backups (
    backup_id INT AUTO_INCREMENT PRIMARY KEY,
    backupdate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    datatype VARCHAR(100) DEFAULT 'products',
    filelocation VARCHAR(500),
    backup_size BIGINT,
    created_by VARCHAR(100)
);

-- Insert sample products for testing
INSERT INTO products (product_id, productname, productdescription, productprice, productsize, productcolor, productquantity, productstatus) VALUES
(123456789012, 'Classic T-Shirt', 'Comfortable cotton t-shirt perfect for everyday wear', 29.99, 'M', 'Blue', 50, 'active'),
(234567890123, 'Denim Jeans', 'Premium denim jeans with modern fit', 79.99, 'L', 'Dark Blue', 30, 'active'),
(345678901234, 'Casual Sneakers', 'Comfortable sneakers for daily activities', 99.99, '42', 'White', 25, 'active');

-- Show the created tables
SHOW TABLES;
SELECT * FROM products;
