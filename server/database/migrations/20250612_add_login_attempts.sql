-- Migration: Add login_attempts table for security tracking
-- Created: 2025-06-12

CREATE TABLE IF NOT EXISTS login_attempts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    success BOOLEAN NOT NULL DEFAULT FALSE,
    activity_type ENUM('login', 'password_reset', 'registration') DEFAULT 'login',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_ip (ip_address),
    INDEX idx_created (created_at),
    INDEX idx_activity (activity_type)
);

-- Add activity_type column if it doesn't exist (for existing installations)
ALTER TABLE login_attempts 
ADD COLUMN IF NOT EXISTS activity_type ENUM('login', 'password_reset', 'registration') DEFAULT 'login' 
AFTER success;