-- Add profile picture and address fields to users table
ALTER TABLE users
ADD COLUMN profile_picture_url VARCHAR(255) NULL,
ADD COLUMN street_address VARCHAR(255) NULL,
ADD COLUMN apartment_suite VARCHAR(100) NULL,
ADD COLUMN city VARCHAR(100) NULL,
ADD COLUMN state_province VARCHAR(100) NULL,
ADD COLUMN postal_code VARCHAR(20) NULL,
ADD COLUMN country VARCHAR(100) NULL,
ADD COLUMN phone VARCHAR(20) NULL;

-- Create user_preferences table
CREATE TABLE user_preferences (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    email_notifications BOOLEAN DEFAULT TRUE,
    order_updates BOOLEAN DEFAULT TRUE,
    promotional_emails BOOLEAN DEFAULT TRUE,
    newsletter_subscription BOOLEAN DEFAULT FALSE,
    theme_preference ENUM('light', 'dark', 'system') DEFAULT 'system',
    language_preference VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_preferences (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default preferences for existing users
INSERT INTO user_preferences (user_id, email_notifications, order_updates, promotional_emails)
SELECT id, TRUE, TRUE, FALSE FROM users;
