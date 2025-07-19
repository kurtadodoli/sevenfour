-- Add sale columns to products table
ALTER TABLE products 
ADD COLUMN is_on_sale BOOLEAN DEFAULT FALSE,
ADD COLUMN sale_discount_percentage DECIMAL(5,2) NULL,
ADD COLUMN sale_start_date DATE NULL,
ADD COLUMN sale_end_date DATE NULL;

-- Index for sale queries
CREATE INDEX idx_products_sale ON products(is_on_sale, sale_start_date, sale_end_date);
