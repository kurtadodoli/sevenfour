-- Create product_categories table if it doesn't exist
-- This file fixes the missing product_categories table

USE seven_four_clothing;

-- Create product_categories table
CREATE TABLE IF NOT EXISTS product_categories (
  category_id INT PRIMARY KEY AUTO_INCREMENT,
  category_name VARCHAR(50) UNIQUE NOT NULL,
  parent_category_id INT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_category_id) REFERENCES product_categories(category_id) ON DELETE SET NULL
);

-- Insert default categories
INSERT IGNORE INTO product_categories (category_name, description) VALUES 
('T-Shirts', 'Comfortable cotton t-shirts for everyday wear'),
('Hoodies', 'Warm and cozy hooded sweatshirts'),
('Shorts', 'Comfortable shorts for casual and athletic wear'),
('Jackets', 'Stylish jackets for all seasons'),
('Accessories', 'Fashion accessories and extras'),
('Pants', 'Casual and formal pants'),
('Dresses', 'Elegant dresses for all occasions'),
('Shoes', 'Footwear collection'),
('Activewear', 'Athletic and fitness clothing'),
('Swimwear', 'Beach and pool wear');

-- Verify the table was created and populated
SELECT 'Product categories table created successfully!' as message;
SELECT COUNT(*) as 'Categories Count' FROM product_categories;
SELECT category_id, category_name, description FROM product_categories ORDER BY category_name;
