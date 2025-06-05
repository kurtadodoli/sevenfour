-- Drop database if exists and create new
DROP DATABASE IF EXISTS seven_four_clothing;
CREATE DATABASE seven_four_clothing;
USE seven_four_clothing;

-- Drop existing tables in correct order
DROP TABLE IF EXISTS cities;
DROP TABLE IF EXISTS provinces;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    birthday DATE NOT NULL,
    gender ENUM('MALE', 'FEMALE', 'PREFER_NOT_TO_SAY') NOT NULL,
    province_id INT NOT NULL,
    city_id INT NOT NULL,
    newsletter BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (province_id) REFERENCES provinces(id),
    FOREIGN KEY (city_id) REFERENCES cities(id)
);

-- Create provinces table
CREATE TABLE provinces (
    id INT AUTO_INCREMENT PRIMARY KEY,
    province_name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create cities table
CREATE TABLE cities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    city_name VARCHAR(100) NOT NULL,
    province_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (province_id) REFERENCES provinces(id) ON DELETE CASCADE,
    UNIQUE KEY unique_city_province (city_name, province_id)
);

-- Add foreign keys to users table
ALTER TABLE users
    ADD CONSTRAINT fk_user_province FOREIGN KEY (province_id) REFERENCES provinces(id),
    ADD CONSTRAINT fk_user_city FOREIGN KEY (city_id) REFERENCES cities(id);

-- Insert default provinces
INSERT INTO provinces (province_name) VALUES 
('Metro Manila'),
('Cebu'),
('Davao'),
('Pampanga'),
('Batangas');

-- Insert default cities
INSERT INTO cities (city_name, province_id) VALUES 
-- Metro Manila cities
('Makati', 1),
('Quezon City', 1),
('Manila', 1),
('Taguig', 1),
-- Cebu cities
('Cebu City', 2),
('Mandaue', 2),
('Lapu-Lapu', 2),
-- Davao cities
('Davao City', 3),
('Tagum', 3),
('Digos', 3),
-- Pampanga cities
('San Fernando', 4),
('Angeles', 4),
('Mabalacat', 4),
-- Batangas cities
('Batangas City', 5),
('Lipa', 5),
('Tanauan', 5);

-- Insert default user
INSERT INTO users (username, email, password, first_name, last_name, birthday, gender, province_id, city_id, newsletter) VALUES 
('john_doe', 'john@example.com', 'Test123!@#', 'John', 'Doe', '1990-01-01', 'MALE', 1, 1, false);