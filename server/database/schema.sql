-- Seven Four Clothing Database Schema
-- Create database
CREATE DATABASE IF NOT EXISTS seven_four_clothing;
USE seven_four_clothing;

-- Drop existing tables if they exist (for clean start)
DROP TABLE IF EXISTS password_reset_tokens;
DROP TABLE IF EXISTS login_attempts;
DROP TABLE IF EXISTS users;

-- Users table with numeric user_id
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    gender ENUM('male', 'female', 'other') NOT NULL,
    birthday DATE NOT NULL,
    role ENUM('customer', 'admin') DEFAULT 'customer',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_active (is_active)
);

-- Login attempts table for security
CREATE TABLE login_attempts (
    attempt_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    success BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email_created (email, created_at),
    INDEX idx_ip_created (ip_address, created_at)
);

-- Password reset tokens
CREATE TABLE password_reset_tokens (
    token_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_expires (expires_at)
);

-- Create admin account with hashed password
-- Password: Admin123!@#
INSERT INTO users (
    first_name, 
    last_name, 
    email, 
    password, 
    gender, 
    birthday, 
    role, 
    is_active
) VALUES (
    'Kurt',
    'Adodoli', 
    'kurtadodoli@gmail.com',
    '$2b$12$8K7Qq8vZ9vZ9vZ9vZ9vZ9uOkZvZ9vZ9vZ9vZ9vZ9vZ9vZ9vZ9vZ9v', -- Placeholder, will be updated
    'other',
    '1990-01-01',
    'admin',
    TRUE
);

-- Display success message
SELECT 'Database schema created successfully!' as message;
