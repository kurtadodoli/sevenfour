-- Simple SQL to create the custom designs table
-- Run this in your MySQL client if needed

USE seven_four_clothing;

CREATE TABLE IF NOT EXISTS custom_design_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    design_id VARCHAR(50) UNIQUE NOT NULL,
    user_id VARCHAR(16) NOT NULL,
    design_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    preferred_color VARCHAR(100),
    size VARCHAR(50),
    description TEXT NOT NULL,
    special_requests TEXT,
    budget VARCHAR(50),
    urgency ENUM('normal', 'rush', 'express') DEFAULT 'normal',
    images JSON,
    status ENUM('pending', 'approved', 'rejected', 'in_progress', 'completed') DEFAULT 'pending',
    admin_notes TEXT,
    estimated_price DECIMAL(10, 2),
    estimated_days INT,
    admin_id VARCHAR(16),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Note: Foreign key constraints can be added separately if needed:
-- ALTER TABLE custom_design_requests ADD FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;
-- ALTER TABLE custom_design_requests ADD FOREIGN KEY (admin_id) REFERENCES users(user_id) ON DELETE SET NULL;
