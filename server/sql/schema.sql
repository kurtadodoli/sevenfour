-- Create the seven_four_clothing database
CREATE DATABASE IF NOT EXISTS seven_four_clothing;
USE seven_four_clothing;

-- Users table for authentication and role-based access control
CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('customer', 'admin', 'staff') NOT NULL DEFAULT 'customer',
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  birthday DATE NOT NULL DEFAULT '2000-01-01',
  gender ENUM('MALE', 'FEMALE', 'PREFER_NOT_TO_SAY') NOT NULL DEFAULT 'PREFER_NOT_TO_SAY',
  province VARCHAR(100) NOT NULL DEFAULT 'Metro Manila',
  city VARCHAR(100) NOT NULL DEFAULT 'Makati',
  newsletter TINYINT(1) NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL
);

-- Provinces table
CREATE TABLE IF NOT EXISTS provinces (
  province_id INT AUTO_INCREMENT PRIMARY KEY,
  province_name VARCHAR(100) NOT NULL UNIQUE
);

-- Cities table
CREATE TABLE IF NOT EXISTS cities (
  city_id INT AUTO_INCREMENT PRIMARY KEY,
  city_name VARCHAR(100) NOT NULL,
  province_id INT NOT NULL,
  FOREIGN KEY (province_id) REFERENCES provinces(province_id) ON DELETE CASCADE
);

-- User logs table
CREATE TABLE IF NOT EXISTS user_logs (
  log_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  action VARCHAR(100) NOT NULL,
  description TEXT NULL,
  ip_address VARCHAR(50) NULL,
  user_agent VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Login attempts table
CREATE TABLE IF NOT EXISTS login_attempts (
  attempt_id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  ip_address VARCHAR(50) NOT NULL,
  user_agent VARCHAR(255) NULL,
  success TINYINT(1) NOT NULL DEFAULT 0,
  attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (email)
);

-- Password reset tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  token_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  is_used TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Products table for storing product information
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Product colors table
CREATE TABLE IF NOT EXISTS product_colors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id VARCHAR(100) NOT NULL,
  color VARCHAR(50) NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
  UNIQUE KEY unique_product_color (product_id, color)
);

-- Product sizes table
CREATE TABLE IF NOT EXISTS product_sizes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id VARCHAR(100) NOT NULL,
  size VARCHAR(20) NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
  UNIQUE KEY unique_product_size (product_id, size)
);

-- Product images table
CREATE TABLE IF NOT EXISTS product_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id VARCHAR(100) NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- Inventory table for tracking stock
CREATE TABLE IF NOT EXISTS inventory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id VARCHAR(100) NOT NULL,
  size_id INT NOT NULL,
  color_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 0,
  critical_level INT NOT NULL DEFAULT 5,
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
  FOREIGN KEY (size_id) REFERENCES product_sizes(id) ON DELETE CASCADE,
  FOREIGN KEY (color_id) REFERENCES product_colors(id) ON DELETE CASCADE,
  UNIQUE KEY unique_inventory_item (product_id, size_id, color_id)
);

-- Shopping cart table
CREATE TABLE IF NOT EXISTS cart (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id VARCHAR(100) NOT NULL,
  size_id INT NOT NULL,
  color_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
  FOREIGN KEY (size_id) REFERENCES product_sizes(id) ON DELETE CASCADE,
  FOREIGN KEY (color_id) REFERENCES product_colors(id) ON DELETE CASCADE,
  UNIQUE KEY unique_cart_item (user_id, product_id, size_id, color_id)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  order_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  order_number VARCHAR(20) NOT NULL UNIQUE,
  status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',
  total_amount DECIMAL(10, 2) NOT NULL,
  shipping_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
  payment_method ENUM('cod', 'bank_transfer', 'gcash') NOT NULL,
  payment_status ENUM('pending', 'paid', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
  shipping_address TEXT NOT NULL,
  billing_address TEXT NOT NULL,
  contact_number VARCHAR(20) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id VARCHAR(100) NOT NULL,
  size VARCHAR(20) NOT NULL,
  color VARCHAR(50) NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- Insert default provinces
INSERT IGNORE INTO provinces (province_name) VALUES
('Metro Manila'),
('Cebu'),
('Davao'),
('Pampanga'),
('Batangas');

-- Insert cities for Metro Manila
INSERT IGNORE INTO cities (city_name, province_id)
SELECT 'Caloocan', province_id FROM provinces WHERE province_name = 'Metro Manila';
INSERT IGNORE INTO cities (city_name, province_id)
SELECT 'Manila', province_id FROM provinces WHERE province_name = 'Metro Manila';
INSERT IGNORE INTO cities (city_name, province_id)
SELECT 'Makati', province_id FROM provinces WHERE province_name = 'Metro Manila';
INSERT IGNORE INTO cities (city_name, province_id)
SELECT 'Quezon City', province_id FROM provinces WHERE province_name = 'Metro Manila';

-- Insert cities for Cebu
INSERT IGNORE INTO cities (city_name, province_id)
SELECT 'Cebu City', province_id FROM provinces WHERE province_name = 'Cebu';
INSERT IGNORE INTO cities (city_name, province_id)
SELECT 'Mandaue', province_id FROM provinces WHERE province_name = 'Cebu';
INSERT IGNORE INTO cities (city_name, province_id)
SELECT 'Lapu-Lapu', province_id FROM provinces WHERE province_name = 'Cebu';

-- Insert cities for Davao
INSERT IGNORE INTO cities (city_name, province_id)
SELECT 'Davao City', province_id FROM provinces WHERE province_name = 'Davao';
INSERT IGNORE INTO cities (city_name, province_id)
SELECT 'Tagum', province_id FROM provinces WHERE province_name = 'Davao';
INSERT IGNORE INTO cities (city_name, province_id)
SELECT 'Digos', province_id FROM provinces WHERE province_name = 'Davao';

-- Insert cities for Pampanga
INSERT IGNORE INTO cities (city_name, province_id)
SELECT 'Angeles', province_id FROM provinces WHERE province_name = 'Pampanga';
INSERT IGNORE INTO cities (city_name, province_id)
SELECT 'San Fernando', province_id FROM provinces WHERE province_name = 'Pampanga';

-- Insert cities for Batangas
INSERT IGNORE INTO cities (city_name, province_id)
SELECT 'Batangas City', province_id FROM provinces WHERE province_name = 'Batangas';
INSERT IGNORE INTO cities (city_name, province_id)
SELECT 'Lipa', province_id FROM provinces WHERE province_name = 'Batangas';

-- Create default admin user
-- Password is 'password123' (hashed using bcrypt)
INSERT IGNORE INTO users 
(username, email, password, role, first_name, last_name, gender, province, city, is_active) 
VALUES 
('admin_user', 'admin@sevenclothing.com', 
'$2b$10$B8JdDYIoY9Q0PMn8S.Wj9uLfs7YIGlP6JgbPKX/IKjLsmJa.CvEo.', 'admin', 
'Admin', 'User', 'PREFER_NOT_TO_SAY', 'Metro Manila', 'Makati', 1);