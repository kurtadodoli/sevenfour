-- Complete Database Schema for DeliveryPage.js
-- This script creates all necessary tables for delivery management

-- =============================================
-- 1. ORDERS TABLE (Enhanced)
-- =============================================
CREATE TABLE IF NOT EXISTS orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20),
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    payment_method VARCHAR(50) DEFAULT 'cash_on_delivery',
    payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Shipping Information from OrderPage.js and CustomPage.js
    shipping_first_name VARCHAR(100),
    shipping_last_name VARCHAR(100),
    shipping_phone VARCHAR(20),
    shipping_email VARCHAR(255),
    shipping_address TEXT NOT NULL,
    shipping_city VARCHAR(100) NOT NULL,
    shipping_province VARCHAR(100) NOT NULL,
    shipping_postal_code VARCHAR(10),
    shipping_notes TEXT,
    
    -- Order source tracking
    order_source ENUM('regular', 'custom_design', 'custom_order') DEFAULT 'regular',
    source_id INT, -- References the original custom design or custom order ID
    
    -- Invoice and transaction references
    invoice_id VARCHAR(50),
    transaction_id VARCHAR(50),
    
    INDEX idx_user_id (user_id),
    INDEX idx_order_number (order_number),
    INDEX idx_status (status),
    INDEX idx_order_date (order_date),
    INDEX idx_order_source (order_source, source_id)
);

-- =============================================
-- 2. ORDER ITEMS TABLE (Enhanced)
-- =============================================
CREATE TABLE IF NOT EXISTS order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_description TEXT,
    product_color VARCHAR(100),
    product_type VARCHAR(100),
    product_size VARCHAR(50),
    product_image VARCHAR(255),
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    
    -- Custom product specifications (for custom orders)
    custom_specifications JSON,
    design_file_url VARCHAR(500),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id),
    INDEX idx_product_id (product_id)
);

-- =============================================
-- 3. DELIVERY SCHEDULES TABLE (Enhanced)
-- =============================================
CREATE TABLE IF NOT EXISTS delivery_schedules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    order_number VARCHAR(50) NOT NULL,
    
    -- Customer Information
    customer_id INT,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    customer_phone VARCHAR(20),
    
    -- Delivery Details
    delivery_date DATE NOT NULL,
    delivery_time_slot VARCHAR(50),
    delivery_status ENUM('pending', 'scheduled', 'in_transit', 'delivered', 'delayed', 'cancelled', 'failed') DEFAULT 'scheduled',
    
    -- Address Information
    delivery_address TEXT NOT NULL,
    delivery_city VARCHAR(100) NOT NULL,
    delivery_province VARCHAR(100) NOT NULL,
    delivery_postal_code VARCHAR(10),
    delivery_contact_phone VARCHAR(20),
    delivery_notes TEXT,
    
    -- Courier Assignment
    courier_id INT,
    
    -- Priority and Fees
    priority_level ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
    delivery_fee DECIMAL(10,2) DEFAULT 0.00,
    
    -- Status Tracking
    scheduled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dispatched_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    
    -- Calendar Display Settings
    calendar_color VARCHAR(7) DEFAULT '#007bff', -- Hex color for calendar display
    display_icon VARCHAR(50) DEFAULT '📦', -- Icon for calendar display
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id),
    INDEX idx_delivery_date (delivery_date),
    INDEX idx_delivery_status (delivery_status),
    INDEX idx_courier_id (courier_id),
    INDEX idx_customer_id (customer_id),
    
    UNIQUE KEY unique_order_schedule (order_id) -- One schedule per order
);

-- =============================================
-- 4. COURIERS TABLE (Enhanced)
-- =============================================
CREATE TABLE IF NOT EXISTS couriers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone_number VARCHAR(20) NOT NULL,
    vehicle_type ENUM('motorcycle', 'car', 'van', 'truck') NOT NULL,
    license_number VARCHAR(50),
    
    -- Performance Tracking
    total_deliveries INT DEFAULT 0,
    successful_deliveries INT DEFAULT 0,
    failed_deliveries INT DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    
    -- Availability
    is_active BOOLEAN DEFAULT TRUE,
    max_daily_deliveries INT DEFAULT 10,
    working_hours_start TIME DEFAULT '08:00:00',
    working_hours_end TIME DEFAULT '18:00:00',
    
    -- Areas of Service
    service_areas JSON, -- Array of cities/areas they serve
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_is_active (is_active),
    INDEX idx_vehicle_type (vehicle_type)
);

-- =============================================
-- 5. DELIVERY CALENDAR TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS delivery_calendar (
    id INT PRIMARY KEY AUTO_INCREMENT,
    calendar_date DATE NOT NULL,
    
    -- Daily Capacity Management
    max_deliveries INT DEFAULT 20,
    current_bookings INT DEFAULT 0,
    is_available BOOLEAN DEFAULT TRUE,
    
    -- Special Day Settings
    is_holiday BOOLEAN DEFAULT FALSE,
    is_weekend BOOLEAN DEFAULT FALSE,
    special_notes TEXT,
    
    -- Weather and Conditions
    weather_status ENUM('good', 'rainy', 'stormy', 'extreme') DEFAULT 'good',
    delivery_restrictions TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_date (calendar_date),
    INDEX idx_calendar_date (calendar_date),
    INDEX idx_is_available (is_available)
);

-- =============================================
-- 6. DELIVERY STATUS HISTORY TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS delivery_status_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    delivery_schedule_id INT NOT NULL,
    order_id INT NOT NULL,
    
    -- Status Change Details
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    status_notes TEXT,
    
    -- Changed By
    changed_by_user_id INT,
    changed_by_name VARCHAR(255),
    
    -- Location and Time
    location_lat DECIMAL(10,8),
    location_lng DECIMAL(11,8),
    location_address TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (delivery_schedule_id) REFERENCES delivery_schedules(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    
    INDEX idx_delivery_schedule_id (delivery_schedule_id),
    INDEX idx_order_id (order_id),
    INDEX idx_new_status (new_status),
    INDEX idx_created_at (created_at)
);

-- =============================================
-- 7. CUSTOM DESIGNS INTEGRATION
-- =============================================
-- Update custom_designs table to include shipping info (only if columns don't exist)

-- Check and add shipping columns to custom_designs
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'seven_four_clothing' 
     AND TABLE_NAME = 'custom_designs' 
     AND COLUMN_NAME = 'shipping_first_name') = 0,
    'ALTER TABLE custom_designs ADD COLUMN shipping_first_name VARCHAR(100)',
    'SELECT "shipping_first_name already exists" as info'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'seven_four_clothing' 
     AND TABLE_NAME = 'custom_designs' 
     AND COLUMN_NAME = 'shipping_last_name') = 0,
    'ALTER TABLE custom_designs ADD COLUMN shipping_last_name VARCHAR(100)',
    'SELECT "shipping_last_name already exists" as info'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'seven_four_clothing' 
     AND TABLE_NAME = 'custom_designs' 
     AND COLUMN_NAME = 'shipping_address') = 0,
    'ALTER TABLE custom_designs ADD COLUMN shipping_address TEXT',
    'SELECT "shipping_address already exists" as info'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =============================================
-- 8. CUSTOM ORDERS INTEGRATION  
-- =============================================
-- Update custom_orders table to include shipping info (only if columns don't exist)

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'seven_four_clothing' 
     AND TABLE_NAME = 'custom_orders' 
     AND COLUMN_NAME = 'shipping_first_name') = 0,
    'ALTER TABLE custom_orders ADD COLUMN shipping_first_name VARCHAR(100)',
    'SELECT "shipping_first_name already exists" as info'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =============================================
-- 9. SAMPLE DATA FOR TESTING
-- =============================================

-- Insert sample couriers
INSERT INTO couriers (name, email, phone_number, vehicle_type, service_areas) VALUES
('Juan Dela Cruz', 'juan@sfc-courier.com', '+63 917 123 4567', 'motorcycle', '["Manila", "Quezon City", "Makati", "Pasig"]'),
('Maria Santos', 'maria@sfc-courier.com', '+63 918 234 5678', 'car', '["Taguig", "Muntinlupa", "Parañaque", "Las Piñas"]'),
('Pedro Rodriguez', 'pedro@sfc-courier.com', '+63 919 345 6789', 'van', '["Marikina", "Pasay", "Caloocan", "Malabon"]'),
('Ana Garcia', 'ana@sfc-courier.com', '+63 920 456 7890', 'motorcycle', '["Navotas", "Valenzuela", "San Juan", "Mandaluyong"]');

-- Initialize calendar for next 90 days
INSERT INTO delivery_calendar (calendar_date, is_weekend, is_holiday) 
SELECT 
    DATE_ADD(CURDATE(), INTERVAL seq DAY) as calendar_date,
    CASE WHEN DAYOFWEEK(DATE_ADD(CURDATE(), INTERVAL seq DAY)) IN (1,7) THEN TRUE ELSE FALSE END as is_weekend,
    FALSE as is_holiday
FROM (
    SELECT 0 as seq UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL
    SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12 UNION ALL SELECT 13 UNION ALL SELECT 14 UNION ALL SELECT 15 UNION ALL SELECT 16 UNION ALL SELECT 17 UNION ALL SELECT 18 UNION ALL SELECT 19 UNION ALL
    SELECT 20 UNION ALL SELECT 21 UNION ALL SELECT 22 UNION ALL SELECT 23 UNION ALL SELECT 24 UNION ALL SELECT 25 UNION ALL SELECT 26 UNION ALL SELECT 27 UNION ALL SELECT 28 UNION ALL SELECT 29 UNION ALL
    SELECT 30 UNION ALL SELECT 31 UNION ALL SELECT 32 UNION ALL SELECT 33 UNION ALL SELECT 34 UNION ALL SELECT 35 UNION ALL SELECT 36 UNION ALL SELECT 37 UNION ALL SELECT 38 UNION ALL SELECT 39 UNION ALL
    SELECT 40 UNION ALL SELECT 41 UNION ALL SELECT 42 UNION ALL SELECT 43 UNION ALL SELECT 44 UNION ALL SELECT 45 UNION ALL SELECT 46 UNION ALL SELECT 47 UNION ALL SELECT 48 UNION ALL SELECT 49 UNION ALL
    SELECT 50 UNION ALL SELECT 51 UNION ALL SELECT 52 UNION ALL SELECT 53 UNION ALL SELECT 54 UNION ALL SELECT 55 UNION ALL SELECT 56 UNION ALL SELECT 57 UNION ALL SELECT 58 UNION ALL SELECT 59 UNION ALL
    SELECT 60 UNION ALL SELECT 61 UNION ALL SELECT 62 UNION ALL SELECT 63 UNION ALL SELECT 64 UNION ALL SELECT 65 UNION ALL SELECT 66 UNION ALL SELECT 67 UNION ALL SELECT 68 UNION ALL SELECT 69 UNION ALL
    SELECT 70 UNION ALL SELECT 71 UNION ALL SELECT 72 UNION ALL SELECT 73 UNION ALL SELECT 74 UNION ALL SELECT 75 UNION ALL SELECT 76 UNION ALL SELECT 77 UNION ALL SELECT 78 UNION ALL SELECT 79 UNION ALL
    SELECT 80 UNION ALL SELECT 81 UNION ALL SELECT 82 UNION ALL SELECT 83 UNION ALL SELECT 84 UNION ALL SELECT 85 UNION ALL SELECT 86 UNION ALL SELECT 87 UNION ALL SELECT 88 UNION ALL SELECT 89
) seq;

-- =============================================
-- 10. INDEXES FOR PERFORMANCE
-- =============================================

-- Additional indexes for better performance
CREATE INDEX idx_orders_customer_info ON orders(customer_name, customer_email);
CREATE INDEX idx_orders_shipping_city ON orders(shipping_city, shipping_province);
CREATE INDEX idx_delivery_schedules_customer_delivery ON delivery_schedules(customer_name, delivery_date, delivery_status);
CREATE INDEX idx_delivery_schedules_calendar_display ON delivery_schedules(delivery_date, calendar_color, display_icon);

-- =============================================
-- SUCCESS MESSAGE
-- =============================================
SELECT 'Database schema for DeliveryPage.js created successfully!' as status;
