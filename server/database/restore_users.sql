-- Restore database to working state
SET FOREIGN_KEY_CHECKS = 0;

-- Drop the broken users table if it exists
DROP TABLE IF EXISTS users;

-- Recreate users table with proper structure
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
    last_login TIMESTAMP NULL
);

-- Insert data from backup
INSERT INTO users (user_id, first_name, last_name, email, password, gender, birthday, role, is_active, created_at, updated_at, last_login)
SELECT user_id, first_name, last_name, email, password, gender, birthday, role, is_active, created_at, updated_at, last_login
FROM users_backup;

-- Set the AUTO_INCREMENT to the next value
SET @max_id = (SELECT MAX(user_id) FROM users);
SET @sql = CONCAT('ALTER TABLE users AUTO_INCREMENT = ', @max_id + 1);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Clean up
DROP TABLE IF EXISTS users_backup;
DROP TABLE IF EXISTS users_new;
