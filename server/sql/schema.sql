-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS seven_four_clothing;
USE seven_four_clothing;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS login_attempts;
DROP TABLE IF EXISTS password_reset_tokens;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    user_id VARCHAR(16) PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'staff', 'customer') DEFAULT 'customer',
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    birthday DATE NOT NULL,
    gender ENUM('male', 'female', 'other') NOT NULL,
    province VARCHAR(100),
    city VARCHAR(100),
    newsletter BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_email (email),
    INDEX idx_username (username)
);

-- Create login attempts table for security monitoring
CREATE TABLE IF NOT EXISTS login_attempts (
    attempt_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    success BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_ip (ip_address)
);

-- Create password reset tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    token_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(16) NOT NULL,
    token VARCHAR(255) NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    INDEX idx_token (token),
    INDEX idx_user (user_id)
);

-- Create admin account
INSERT INTO users (
    user_id,
    username,
    email,
    password,
    role,
    first_name,
    last_name,
    birthday,
    gender,
    is_active
) VALUES (
    'ADMIN000001',
    'admin',
    'admin@sevenfour.com',
    '$2b$10$5QH8K2IxCcJmBGT5BG1vD.sPq8E9BZqZH1PBx/4Tl9ZFEHe0v3KGi', -- This is the hashed version of 'Admin@123'
    'admin',
    'Admin',
    'User',
    '2000-01-01',
    'other',
    TRUE
) ON DUPLICATE KEY UPDATE
    password = VALUES(password),
    role = VALUES(role),
    is_active = VALUES(is_active);