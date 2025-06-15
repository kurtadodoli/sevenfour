-- Cart Management Schema
-- Execute this file to create the necessary tables for cart functionality

USE seven_four_clothing;

-- Carts table - one cart per user
CREATE TABLE IF NOT EXISTS carts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_cart (user_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Cart items table - items in each cart
CREATE TABLE IF NOT EXISTS cart_items (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  cart_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  color_id BIGINT,
  size_id BIGINT,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_cart (cart_id),
  INDEX idx_product (product_id),
  UNIQUE KEY unique_cart_product_variant (cart_id, product_id, color_id, size_id),
  FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
  FOREIGN KEY (color_id) REFERENCES product_colors(id) ON DELETE SET NULL,
  FOREIGN KEY (size_id) REFERENCES product_sizes(id) ON DELETE SET NULL
);

-- Display success message
SELECT 'Cart management schema created successfully!' as message;
