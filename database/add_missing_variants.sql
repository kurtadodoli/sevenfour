-- Create missing product variants for the pending orders
-- This will allow the stock management system to work properly

INSERT INTO product_variants (product_id, size, color, stock_quantity, available_quantity, reserved_quantity, created_at, last_updated) VALUES
-- Product 449923402814 - No Struggles No Progress
(449923402814, 'S', 'Black', 50, 50, 0, NOW(), NOW()),
(449923402814, 'M', 'Black', 50, 50, 0, NOW(), NOW()),
(449923402814, 'L', 'Black', 50, 50, 0, NOW(), NOW()),
(449923402814, 'S', 'White', 30, 30, 0, NOW(), NOW()),
(449923402814, 'M', 'White', 30, 30, 0, NOW(), NOW()),
(449923402814, 'L', 'White', 30, 30, 0, NOW(), NOW()),

-- Product 435458183175 - Love Is An Evil Thing
(435458183175, 'S', 'Black', 45, 45, 0, NOW(), NOW()),
(435458183175, 'M', 'Black', 45, 45, 0, NOW(), NOW()),
(435458183175, 'L', 'Black', 45, 45, 0, NOW(), NOW()),
(435458183175, 'S', 'White', 25, 25, 0, NOW(), NOW()),
(435458183175, 'M', 'White', 25, 25, 0, NOW(), NOW()),
(435458183175, 'L', 'White', 25, 25, 0, NOW(), NOW());

-- Update the main products table to reflect total stock from variants
UPDATE products p
SET p.total_stock = (
    SELECT COALESCE(SUM(pv.stock_quantity), p.productquantity) 
    FROM product_variants pv 
    WHERE pv.product_id = p.product_id
),
p.total_available_stock = (
    SELECT COALESCE(SUM(pv.available_quantity), p.productquantity) 
    FROM product_variants pv 
    WHERE pv.product_id = p.product_id
),
p.total_reserved_stock = (
    SELECT COALESCE(SUM(pv.reserved_quantity), 0) 
    FROM product_variants pv 
    WHERE pv.product_id = p.product_id
),
p.stock_status = CASE 
    WHEN (SELECT COALESCE(SUM(pv.available_quantity), p.productquantity) FROM product_variants pv WHERE pv.product_id = p.product_id) <= 0 THEN 'out_of_stock'
    WHEN (SELECT COALESCE(SUM(pv.available_quantity), p.productquantity) FROM product_variants pv WHERE pv.product_id = p.product_id) <= 5 THEN 'critical_stock'
    WHEN (SELECT COALESCE(SUM(pv.available_quantity), p.productquantity) FROM product_variants pv WHERE pv.product_id = p.product_id) <= 15 THEN 'low_stock'
    ELSE 'in_stock'
END,
p.last_stock_update = CURRENT_TIMESTAMP
WHERE p.product_id IN (449923402814, 435458183175);
