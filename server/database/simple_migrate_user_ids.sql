-- Simple migration to long random user IDs
-- Run this script to update user IDs to long random numbers

USE seven_four_clothing;

-- Create backup
CREATE TABLE users_backup_$(date +%Y%m%d) AS SELECT * FROM users;

-- Create mapping table to track old to new ID relationships
CREATE TABLE user_id_mapping (
    old_id INT,
    new_id BIGINT UNSIGNED,
    email VARCHAR(100)
);

-- Insert mappings with random 16-digit numbers
INSERT INTO user_id_mapping (old_id, new_id, email)
SELECT 
    user_id as old_id,
    FLOOR(1000000000000000 + RAND() * 8999999999999999) as new_id,
    email
FROM users;

-- Show the mapping
SELECT * FROM user_id_mapping;

-- Create new users table with BIGINT user_id
CREATE TABLE users_new (
    user_id BIGINT UNSIGNED PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    gender ENUM('MALE', 'FEMALE', 'OTHER') NOT NULL,
    birthday DATE NOT NULL,
    role ENUM('customer', 'admin') DEFAULT 'customer',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL
);

-- Migrate data using the mapping
INSERT INTO users_new
SELECT 
    m.new_id as user_id,
    u.first_name,
    u.last_name,
    u.email,
    u.password,
    u.gender,
    u.birthday,
    u.role,
    u.is_active,
    u.created_at,
    u.updated_at,
    u.last_login
FROM users u
JOIN user_id_mapping m ON u.user_id = m.old_id;

-- Replace the old table
DROP TABLE users;
RENAME TABLE users_new TO users;

-- Show results
SELECT 'Migration completed. New user IDs:' as message;
SELECT user_id, email, role FROM users;

-- Clean up
DROP TABLE user_id_mapping;
