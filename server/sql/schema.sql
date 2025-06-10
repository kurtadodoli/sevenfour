-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS seven_four_clothing;
USE seven_four_clothing;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    gender ENUM('male', 'female', 'other') NOT NULL,
    birthday DATE NOT NULL,
    role ENUM('customer', 'admin') DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_email (email)
);

-- Create default admin user (password: admin123)
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
    '$2b$10$xLtGxfXiwX5MF7HnXQyuQ.YqI.JzX0ZD6IKJF9Xp5kH9vmJ3vX3Hy',
    'other',
    '1990-01-01',
    'admin'
);