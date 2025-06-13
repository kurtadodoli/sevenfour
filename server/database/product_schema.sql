-- Product Management Schema
-- Execute this file to create the necessary tables for product management

USE seven_four_clothing;

-- Products table
CREATE TABLE IF NOT EXISTS products (
  product_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  brand VARCHAR(100),
  price DECIMAL(10, 2) NOT NULL,
  cost_price DECIMAL(10, 2),
  status ENUM('active', 'inactive') DEFAULT 'active',
  is_featured BOOLEAN DEFAULT FALSE,
  stock_status ENUM('in_stock', 'low_stock', 'out_of_stock') DEFAULT 'in_stock',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by BIGINT,
  updated_by BIGINT,
  is_archived BOOLEAN DEFAULT FALSE,
  INDEX idx_category (category),
  INDEX idx_status (status),
  INDEX idx_featured (is_featured),
  FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL,
  FOREIGN KEY (updated_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Product variants (sizes, colors, etc)
CREATE TABLE IF NOT EXISTS product_variants (
  variant_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  product_id BIGINT NOT NULL,
  size VARCHAR(20),
  color VARCHAR(50),
  sku VARCHAR(100),
  stock_quantity INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_product (product_id),
  INDEX idx_stock (stock_quantity),
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- Product sizes table for filtering
CREATE TABLE IF NOT EXISTS product_sizes (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  product_id BIGINT NOT NULL,
  size VARCHAR(20) NOT NULL,
  UNIQUE KEY unique_product_size (product_id, size),
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- Product colors table for filtering
CREATE TABLE IF NOT EXISTS product_colors (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  product_id BIGINT NOT NULL,
  color VARCHAR(50) NOT NULL,
  color_code VARCHAR(10),
  UNIQUE KEY unique_product_color (product_id, color),
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- Product images
CREATE TABLE IF NOT EXISTS product_images (
  image_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  product_id BIGINT NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  display_order INT DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
  INDEX idx_product_order (product_id, display_order)
);

-- Product audit log for tracking changes
CREATE TABLE IF NOT EXISTS product_audit_log (
  log_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  product_id BIGINT NOT NULL,
  user_id BIGINT,
  action ENUM('created', 'updated', 'deleted', 'restored') NOT NULL,
  action_details JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
  INDEX idx_product (product_id),
  INDEX idx_user (user_id),
  INDEX idx_action (action),
  INDEX idx_created (created_at)
);

-- Create database trigger for product changes
DELIMITER //

-- Trigger for logging product creation
CREATE TRIGGER after_product_insert
AFTER INSERT ON products
FOR EACH ROW
BEGIN
  INSERT INTO product_audit_log (product_id, user_id, action, action_details)
  VALUES (NEW.product_id, NEW.created_by, 'created', JSON_OBJECT('name', NEW.name, 'category', NEW.category, 'price', NEW.price));
END //

-- Trigger for logging product updates
CREATE TRIGGER after_product_update
AFTER UPDATE ON products
FOR EACH ROW
BEGIN
  -- Only log if certain fields changed
  IF OLD.name != NEW.name OR 
     OLD.description != NEW.description OR
     OLD.price != NEW.price OR
     OLD.category != NEW.category OR
     OLD.status != NEW.status OR
     OLD.is_archived != NEW.is_archived THEN
    
    INSERT INTO product_audit_log (product_id, user_id, action, action_details)
    VALUES (
      NEW.product_id, 
      NEW.updated_by, 
      IF(NEW.is_archived = TRUE AND OLD.is_archived = FALSE, 'deleted', 'updated'),
      JSON_OBJECT(
        'name', IF(OLD.name != NEW.name, CONCAT(OLD.name, ' -> ', NEW.name), NULL),
        'price', IF(OLD.price != NEW.price, CONCAT(OLD.price, ' -> ', NEW.price), NULL),
        'status', IF(OLD.status != NEW.status, CONCAT(OLD.status, ' -> ', NEW.status), NULL),
        'category', IF(OLD.category != NEW.category, CONCAT(OLD.category, ' -> ', NEW.category), NULL),
        'archived', IF(OLD.is_archived != NEW.is_archived, CONCAT(OLD.is_archived, ' -> ', NEW.is_archived), NULL)
      )
    );
  END IF;
END //

DELIMITER ;

-- Sample product categories
CREATE TABLE IF NOT EXISTS product_categories (
  category_id INT PRIMARY KEY AUTO_INCREMENT,
  category_name VARCHAR(50) UNIQUE NOT NULL,
  parent_category_id INT,
  description TEXT,
  FOREIGN KEY (parent_category_id) REFERENCES product_categories(category_id) ON DELETE SET NULL
);

-- Insert default categories
INSERT IGNORE INTO product_categories (category_name) VALUES 
('T-Shirts'),
('Hoodies'),
('Shorts'),
('Jackets'),
('Accessories');

-- Display success message
SELECT 'Product management schema created successfully!' as message;
