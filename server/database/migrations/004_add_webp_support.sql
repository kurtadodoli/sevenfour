-- Add webp_url column to product_images table
ALTER TABLE product_images
ADD COLUMN webp_url VARCHAR(255),
ADD COLUMN thumbnail_url VARCHAR(255),
ADD COLUMN webp_thumbnail_url VARCHAR(255),
ADD COLUMN metadata JSON,
ADD COLUMN optimized_at TIMESTAMP;
