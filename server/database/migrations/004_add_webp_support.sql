-- 004_add_webp_support.sql
-- Add WebP and image optimization support to product_images table

-- Add webp_url and optimization columns to product_images table
ALTER TABLE product_images
ADD COLUMN webp_url VARCHAR(255) AFTER image_url,
ADD COLUMN thumbnail_url VARCHAR(255) AFTER webp_url,
ADD COLUMN webp_thumbnail_url VARCHAR(255) AFTER thumbnail_url,
ADD COLUMN file_size INT COMMENT 'Size in bytes',
ADD COLUMN webp_file_size INT COMMENT 'WebP size in bytes for compression comparison',
ADD COLUMN image_width INT,
ADD COLUMN image_height INT,
ADD COLUMN metadata JSON,
ADD COLUMN optimized_at TIMESTAMP NULL,
ADD COLUMN optimization_status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending';

-- Add indexes for better performance
ALTER TABLE product_images
ADD INDEX idx_optimization_status (optimization_status),
ADD INDEX idx_optimized_at (optimized_at);

-- Optional: Add constraint to ensure at least one image format exists
-- ALTER TABLE product_images
-- ADD CONSTRAINT chk_image_url_exists CHECK (image_url IS NOT NULL OR webp_url IS NOT NULL);

-- Create image_optimization_queue table for batch processing
CREATE TABLE image_optimization_queue (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_image_id INT NOT NULL,
    priority ENUM('low', 'normal', 'high') DEFAULT 'normal',
    status ENUM('queued', 'processing', 'completed', 'failed') DEFAULT 'queued',
    attempts INT DEFAULT 0,
    max_attempts INT DEFAULT 3,
    error_message TEXT,
    scheduled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (product_image_id) REFERENCES product_images(id) ON DELETE CASCADE,
    INDEX idx_queue_status (status),
    INDEX idx_queue_priority (priority, scheduled_at),
    INDEX idx_queue_attempts (attempts, max_attempts)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create image_optimization_log table for tracking optimization history
CREATE TABLE image_optimization_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_image_id INT NOT NULL,
    optimization_type ENUM('webp_conversion', 'thumbnail_generation', 'compression') NOT NULL,
    original_size BIGINT,
    optimized_size BIGINT,
    compression_ratio DECIMAL(5,2) COMMENT 'Percentage of size reduction',
    processing_time_ms INT COMMENT 'Processing time in milliseconds',
    success BOOLEAN DEFAULT FALSE,
    error_details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (product_image_id) REFERENCES product_images(id) ON DELETE CASCADE,
    INDEX idx_log_image (product_image_id),
    INDEX idx_log_type (optimization_type),
    INDEX idx_log_success (success)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert existing product images into optimization queue
INSERT INTO image_optimization_queue (product_image_id, priority)
SELECT id, 'normal'
FROM product_images
WHERE optimization_status = 'pending';

-- Update existing product_images to set initial optimization status
UPDATE product_images 
SET optimization_status = 'pending' 
WHERE optimization_status IS NULL;