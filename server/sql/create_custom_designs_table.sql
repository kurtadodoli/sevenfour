-- Create custom_design_requests table
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
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES users(user_id) ON DELETE SET NULL,
    
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Add some sample data for testing (optional)
-- INSERT INTO custom_design_requests (
--     design_id, user_id, design_name, category, description, 
--     images, status, created_at
-- ) VALUES (
--     'CD1703673600001', 'sample_user_id', 'Custom T-Shirt Design', 't-shirts', 
--     'A custom t-shirt with a unique graphic design featuring abstract patterns.', 
--     '["design-sample1.jpg", "design-sample2.jpg"]', 'pending', NOW()
-- );
