-- Direct SQL script to fix inventory issue
-- Run this in your MySQL database to fix stock synchronization

-- 1. Check current state of "No Struggles No Progress" product
SELECT 
  product_id,
  productname,
  productquantity,
  total_stock,
  total_available_stock,
  total_reserved_stock,
  stock_status,
  sizes
FROM products 
WHERE productname = 'No Struggles No Progress';

-- 2. Fix the stock synchronization issue
-- Set total_available_stock to match the displayed stock (146)
UPDATE products 
SET 
  total_available_stock = 146,
  total_reserved_stock = 0,
  productquantity = 146,
  total_stock = 146,
  stock_status = 'in_stock',
  last_stock_update = CURRENT_TIMESTAMP
WHERE productname = 'No Struggles No Progress';

-- 3. Update the sizes JSON to match the total stock
UPDATE products 
SET sizes = '[
  {"size":"S","stock":29},
  {"size":"M","stock":29},
  {"size":"L","stock":29},
  {"size":"XL","stock":29},
  {"size":"XXL","stock":30}
]'
WHERE productname = 'No Struggles No Progress';

-- 4. Verify the fix
SELECT 
  product_id,
  productname,
  productquantity,
  total_stock,
  total_available_stock,
  total_reserved_stock,
  stock_status,
  sizes
FROM products 
WHERE productname = 'No Struggles No Progress';

-- 5. Test the inventory update logic (this simulates confirming an order for 5 items)
-- DO NOT RUN THIS YET - just to show you what happens when you confirm an order
/*
UPDATE products 
SET total_available_stock = total_available_stock - 5,
    total_reserved_stock = COALESCE(total_reserved_stock, 0) + 5,
    last_stock_update = CURRENT_TIMESTAMP,
    stock_status = CASE 
        WHEN (total_available_stock - 5) <= 0 THEN 'out_of_stock'
        WHEN (total_available_stock - 5) <= 5 THEN 'critical_stock'
        WHEN (total_available_stock - 5) <= 15 THEN 'low_stock'
        ELSE 'in_stock'
    END
WHERE productname = 'No Struggles No Progress';
*/

-- 6. Check if the maintenance API uses the correct field
-- The maintenance route should now return total_available_stock as displayStock
