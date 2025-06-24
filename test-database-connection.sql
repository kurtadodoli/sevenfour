-- Quick test to verify database connection and check current stock
SELECT 
  'Database Connection Test' as test_type,
  NOW() as current_time,
  DATABASE() as current_database;

-- Check if the products table exists and has the required fields
DESCRIBE products;

-- Check current stock for "No Struggles No Progress"
SELECT 
  product_id,
  productname,
  productquantity,
  total_stock,
  total_available_stock,
  total_reserved_stock,
  stock_status
FROM products 
WHERE productname LIKE '%No Struggles%' 
LIMIT 1;

-- Check recent orders for this product
SELECT 
  o.id,
  o.order_number,
  o.status,
  o.order_date,
  oi.quantity,
  p.productname
FROM orders o
JOIN order_items oi ON o.invoice_id = oi.invoice_id
JOIN products p ON oi.product_id = p.product_id
WHERE p.productname LIKE '%No Struggles%'
ORDER BY o.order_date DESC
LIMIT 5;
