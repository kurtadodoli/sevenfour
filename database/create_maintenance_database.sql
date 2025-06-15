-- Create database that perfectly matches MaintenancePage.js

-- Create fresh database
DROP DATABASE IF EXISTS seven_four_clothing;
CREATE DATABASE seven_four_clothing;
USE seven_four_clothing;

-- Create products table matching MaintenancePage.js form fields exactly
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT UNIQUE NOT NULL,
    productname VARCHAR(255) NOT NULL,
    productimage VARCHAR(255),
    productdescription TEXT,
    productprice DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    productsize VARCHAR(100),
    productcolor VARCHAR(100),
    productquantity INT NOT NULL DEFAULT 0,
    productstatus ENUM('active', 'inactive', 'archived') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create archives table for archived products
CREATE TABLE product_archives (
    archive_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    archiveddate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unarchiveddate TIMESTAMP NULL,
    archived_by VARCHAR(100)
);

-- Create backups table for backup operations
CREATE TABLE data_backups (
    backup_id INT AUTO_INCREMENT PRIMARY KEY,
    backupdate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    datatype VARCHAR(100) DEFAULT 'products',
    filelocation VARCHAR(500),
    backup_size BIGINT,
    created_by VARCHAR(100)
);

-- Show created tables
SHOW TABLES;
DESCRIBE products;

SELECT "✅ Database created successfully - ready for MaintenancePage.js" AS status;
