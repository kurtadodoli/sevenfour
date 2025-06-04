USE seven_four_clothing;

-- Insert sample users (passwords are hashed, "password123" for all users)
INSERT INTO users (username, email, password, role, first_name, last_name, gender, province, city) VALUES
('admin', 'admin@sevenfour.com', '$2b$10$X/tpXPrfFLXTEpGAFVt5YO8t0qPCUvVw4OFyeWbP3c9Ap5jS1Jn/i', 'admin', 'Admin', 'User', 'MALE', 'Metro Manila', 'Makati'),
('staff', 'staff@sevenfour.com', '$2b$10$X/tpXPrfFLXTEpGAFVt5YO8t0qPCUvVw4OFyeWbP3c9Ap5jS1Jn/i', 'staff', 'Staff', 'User', 'FEMALE', 'Metro Manila', 'Quezon City'),
('customer', 'customer@example.com', '$2b$10$X/tpXPrfFLXTEpGAFVt5YO8t0qPCUvVw4OFyeWbP3c9Ap5jS1Jn/i', 'customer', 'John', 'Doe', 'MALE', 'Metro Manila', 'Manila');

-- Insert products from T-shirts category
INSERT INTO products (product_id, name, price, category, description)
VALUES
('betrayal', '"Betrayal" Shirt', 599, 'T-Shirts', 'The "Betrayal" Shirt features a striking design that captures the complexity of trust and loyalty.'),
('blinded', '"Blinded" Shirt', 599, 'T-Shirts', 'Our "Blinded" Shirt offers a thought-provoking design that challenges perceptions.'),
('bliss-this-mess', '"Bliss This Mess" Shirt', 799, 'T-Shirts', 'A statement piece with bold typography and premium cotton fabric.'),
('bogo-tee', '"Bogo Tee" Shirt', 629, 'T-Shirts', 'Simple yet striking box logo tee made from high-quality materials.'),
('break-the-loop', '"Break The Loop" Shirt', 599, 'T-Shirts', 'Break free from repetitive patterns with this distinctive design.'),
('call-shot', '"Call Shot" Shirt', 599, 'T-Shirts', 'A bold design for those who know their worth and stand by their decisions.');

-- Insert products from Shorts category
INSERT INTO products (product_id, name, price, category, description)
VALUES
('cargo-v1', '"Cargo V1" Shorts', 699, 'Shorts', 'The "Cargo V1" Shorts offer practical style with ample pocket space and a comfortable fit.'),
('cargo-v3', '"Cargo V3" Shorts', 799, 'Shorts', 'Our upgraded "Cargo V3" Shorts feature enhanced durability and a modern cut.'),
('fiery-shorts', '"Fiery" Shorts', 799, 'Shorts', 'Bold red shorts with distinctive design elements and premium fabric.'),
('lightning-mesh-shorts', '"Lightning Mesh" Shorts', 799, 'Shorts', 'Breathable mesh shorts in an electric blue colorway, perfect for active wear.'),
('paisley-shorts', '"Paisley" Shorts', 799, 'Shorts', 'Classic paisley pattern shorts with a modern twist.'),
('racer-mesh-shorts', '"Racer Mesh" Shorts', 799, 'Shorts', 'Lightweight mesh shorts designed for maximum mobility.');

-- Insert products from Hoodies category
INSERT INTO products (product_id, name, price, category, description)
VALUES
('i-got-your-back', '"I Got Your Back" Hoodie', 1200, 'Hoodies', 'The "I Got Your Back" Hoodie is both a statement piece and a cozy essential for your wardrobe.'),
('strangers-to-family', '"Strangers To Family" Hoodie', 1500, 'Hoodies', 'Our "Strangers To Family" Hoodie celebrates connection with premium comfort.'),
('tangerine-hoodie', '"Tangerine" Hoodie', 1000, 'Hoodies', 'Vibrant hoodie with distinctive color and soft interior for maximum comfort.');

-- Insert product colors (partial list)
INSERT INTO product_colors (product_id, color) VALUES
-- T-shirts
('betrayal', 'Black'),
('betrayal', 'White'),
('blinded', 'Beige'),
('blinded', 'Black'),
('blinded', 'White'),
('bliss-this-mess', 'Black'),
('bliss-this-mess', 'White'),
('bogo-tee', 'Light Blue'),
('bogo-tee', 'Dark Green'),
-- Shorts
('cargo-v1', 'Beige'),
('cargo-v3', 'Black'),
('cargo-v3', 'White'),
('fiery-shorts', 'Fiery Red'),
('lightning-mesh-shorts', 'Lightning Blue'),
-- Hoodies
('i-got-your-back', 'Black'),
('i-got-your-back', 'Beige'),
('strangers-to-family', 'Black'),
('strangers-to-family', 'Gray'),
('tangerine-hoodie', 'Black'),
('tangerine-hoodie', 'Gray');

-- Insert product sizes (partial list)
INSERT INTO product_sizes (product_id, size) VALUES
-- T-shirts
('betrayal', 'S'),
('betrayal', 'M'),
('betrayal', 'L'),
('betrayal', 'XL'),
('blinded', 'S'),
('blinded', 'M'),
('blinded', 'L'),
('blinded', 'XL'),
('bliss-this-mess', 'S'),
('bliss-this-mess', 'M'),
('bliss-this-mess', 'L'),
('bliss-this-mess', 'XL'),
-- Shorts
('cargo-v1', 'S'),
('cargo-v1', 'M'),
('cargo-v1', 'L'),
('cargo-v3', 'S'),
('cargo-v3', 'M'),
('cargo-v3', 'L'),
-- Hoodies
('i-got-your-back', 'S'),
('i-got-your-back', 'M'),
('i-got-your-back', 'L'),
('strangers-to-family', 'S'),
('strangers-to-family', 'M'),
('strangers-to-family', 'L'),
('tangerine-hoodie', 'S'),
('tangerine-hoodie', 'M'),
('tangerine-hoodie', 'L');

-- Insert product images (sample paths)
INSERT INTO product_images (product_id, image_url, display_order) VALUES
-- T-shirts (sample images)
('betrayal', '/assets/images/t-shirts/betrayal/betrayal1.jpg', 1),
('betrayal', '/assets/images/t-shirts/betrayal/betrayal2.jpg', 2),
('blinded', '/assets/images/t-shirts/blinded/blinded1.jpg', 1),
('blinded', '/assets/images/t-shirts/blinded/blinded2.jpg', 2),
('blinded', '/assets/images/t-shirts/blinded/blinded3.jpg', 3),
-- Shorts
('cargo-v1', '/assets/images/shorts/cargov1/cargov1-1.jpg', 1),
('cargo-v1', '/assets/images/shorts/cargov1/cargov1-2.jpg', 2),
('cargo-v3', '/assets/images/shorts/cargov3/cargov3-1.jpg', 1),
('cargo-v3', '/assets/images/shorts/cargov3/cargov3-2.jpg', 2),
-- Hoodies
('i-got-your-back', '/assets/images/hoodies/i-got-your-back/i-got-your-back1.jpg', 1),
('i-got-your-back', '/assets/images/hoodies/i-got-your-back/i-got-your-back2.jpg', 2),
('strangers-to-family', '/assets/images/hoodies/strangerstofamily/strangerstofamily-hoodie1.jpg', 1),
('strangers-to-family', '/assets/images/hoodies/strangerstofamily/strangerstofamily-hoodie2.jpg', 2);

-- Insert inventory data (with initial stock)
-- This will create sample inventory entries for each product, size, and color combination
INSERT INTO inventory (product_id, size_id, color_id, quantity, critical_level)
SELECT 
  p.product_id,
  ps.id as size_id,
  pc.id as color_id,
  FLOOR(10 + RAND() * 40) as quantity, -- Random quantity between 10-50
  5 as critical_level
FROM 
  products p
JOIN 
  product_sizes ps ON p.product_id = ps.product_id
JOIN 
  product_colors pc ON p.product_id = pc.product_id
GROUP BY 
  p.product_id, ps.id, pc.id;