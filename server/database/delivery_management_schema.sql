-- Database Schema for Delivery Management System
-- This file creates tables for managing deliveries for both regular orders and custom orders

-- 1. Delivery Schedules Table
-- Manages delivery scheduling for all types of orders
CREATE TABLE IF NOT EXISTS delivery_schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    order_type ENUM('regular', 'custom') NOT NULL DEFAULT 'regular',
    customer_id INT NOT NULL,
    
    -- Delivery Information
    delivery_date DATE NOT NULL,
    delivery_time_slot VARCHAR(50) DEFAULT NULL, -- e.g., '9:00-12:00', '1:00-5:00'
    delivery_status ENUM('scheduled', 'in_transit', 'delivered', 'delayed', 'cancelled') DEFAULT 'scheduled',
    
    -- Address Information  
    delivery_address TEXT NOT NULL,
    delivery_city VARCHAR(100) NOT NULL,
    delivery_postal_code VARCHAR(20) DEFAULT NULL,
    delivery_province VARCHAR(100) DEFAULT NULL,
    delivery_contact_phone VARCHAR(20) DEFAULT NULL,
    delivery_notes TEXT DEFAULT NULL,
    
    -- Delivery Tracking
    tracking_number VARCHAR(100) UNIQUE DEFAULT NULL,
    courier_name VARCHAR(100) DEFAULT NULL,
    estimated_delivery_time DATETIME DEFAULT NULL,
    actual_delivery_time DATETIME DEFAULT NULL,
    
    -- Priority and Logistics
    priority_level ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
    delivery_fee DECIMAL(10,2) DEFAULT 0.00,
    
    -- Status Management
    scheduled_by INT DEFAULT NULL, -- admin user who scheduled
    delivered_by INT DEFAULT NULL, -- courier/delivery person
    cancelled_reason TEXT DEFAULT NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (scheduled_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (delivered_by) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Indexes for performance
    INDEX idx_order_type_id (order_type, order_id),
    INDEX idx_delivery_date (delivery_date),
    INDEX idx_delivery_status (delivery_status),
    INDEX idx_customer_id (customer_id),
    INDEX idx_tracking_number (tracking_number)
);

-- 2. Delivery Items Table  
-- Tracks individual items in each delivery (for inventory management)
CREATE TABLE IF NOT EXISTS delivery_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    delivery_schedule_id INT NOT NULL,
    
    -- Item Information
    product_id INT DEFAULT NULL, -- For regular orders
    custom_design_id INT DEFAULT NULL, -- For custom orders
    product_name VARCHAR(255) NOT NULL,
    product_type VARCHAR(100) DEFAULT NULL,
    
    -- Variant Information
    size VARCHAR(50) DEFAULT NULL,
    color VARCHAR(100) DEFAULT NULL,
    
    -- Quantity and Pricing
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    
    -- Custom Order Specific
    custom_instructions TEXT DEFAULT NULL,
    production_status ENUM('pending', 'in_production', 'completed', 'shipped') DEFAULT 'pending',
    production_start_date DATE DEFAULT NULL,
    production_completion_date DATE DEFAULT NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (delivery_schedule_id) REFERENCES delivery_schedules(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_delivery_schedule_id (delivery_schedule_id),
    INDEX idx_product_id (product_id),
    INDEX idx_custom_design_id (custom_design_id),
    INDEX idx_production_status (production_status)
);

-- 3. Delivery Routes Table
-- Optimizes delivery routes for efficiency
CREATE TABLE IF NOT EXISTS delivery_routes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    route_name VARCHAR(100) NOT NULL,
    route_date DATE NOT NULL,
    driver_id INT DEFAULT NULL,
    vehicle_info VARCHAR(255) DEFAULT NULL,
    
    -- Route Optimization
    start_location VARCHAR(255) DEFAULT NULL,
    estimated_duration INT DEFAULT NULL, -- in minutes
    actual_duration INT DEFAULT NULL, -- in minutes
    total_distance DECIMAL(8,2) DEFAULT NULL, -- in kilometers
    
    -- Route Status
    route_status ENUM('planned', 'in_progress', 'completed', 'cancelled') DEFAULT 'planned',
    start_time DATETIME DEFAULT NULL,
    end_time DATETIME DEFAULT NULL,
    
    -- Cost Management
    fuel_cost DECIMAL(10,2) DEFAULT 0.00,
    driver_fee DECIMAL(10,2) DEFAULT 0.00,
    vehicle_maintenance_cost DECIMAL(10,2) DEFAULT 0.00,
    
    -- Notes and Comments
    route_notes TEXT DEFAULT NULL,
    completion_notes TEXT DEFAULT NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_route_date (route_date),
    INDEX idx_route_status (route_status),
    INDEX idx_driver_id (driver_id)
);

-- 4. Delivery Route Stops Table
-- Individual stops on each delivery route
CREATE TABLE IF NOT EXISTS delivery_route_stops (
    id INT AUTO_INCREMENT PRIMARY KEY,
    route_id INT NOT NULL,
    delivery_schedule_id INT NOT NULL,
    
    -- Stop Information
    stop_order INT NOT NULL, -- Order of this stop in the route
    estimated_arrival_time DATETIME DEFAULT NULL,
    actual_arrival_time DATETIME DEFAULT NULL,
    estimated_duration INT DEFAULT 15, -- minutes expected at this stop
    actual_duration INT DEFAULT NULL,
    
    -- Stop Status
    stop_status ENUM('pending', 'en_route', 'arrived', 'completed', 'failed') DEFAULT 'pending',
    delivery_attempt_count INT DEFAULT 0,
    
    -- Location Details
    stop_address TEXT NOT NULL,
    stop_coordinates VARCHAR(100) DEFAULT NULL, -- lat,lng format
    access_instructions TEXT DEFAULT NULL,
    
    -- Delivery Outcome
    delivery_success BOOLEAN DEFAULT NULL,
    failure_reason TEXT DEFAULT NULL,
    recipient_name VARCHAR(255) DEFAULT NULL,
    recipient_signature_path VARCHAR(500) DEFAULT NULL,
    delivery_photo_path VARCHAR(500) DEFAULT NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (route_id) REFERENCES delivery_routes(id) ON DELETE CASCADE,
    FOREIGN KEY (delivery_schedule_id) REFERENCES delivery_schedules(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_route_id (route_id),
    INDEX idx_delivery_schedule_id (delivery_schedule_id),
    INDEX idx_stop_order (route_id, stop_order),
    INDEX idx_stop_status (stop_status)
);

-- 5. Delivery Calendar Table
-- Manages delivery calendar availability and admin-controlled dates
CREATE TABLE IF NOT EXISTS delivery_calendar (
    id INT AUTO_INCREMENT PRIMARY KEY,
    calendar_date DATE NOT NULL UNIQUE,
    
    -- Availability Settings
    is_available BOOLEAN DEFAULT TRUE,
    max_deliveries INT DEFAULT 50, -- Maximum deliveries allowed per day
    current_deliveries INT DEFAULT 0, -- Current scheduled deliveries
    
    -- Time Slot Management
    morning_slot_available BOOLEAN DEFAULT TRUE, -- 9:00-12:00
    afternoon_slot_available BOOLEAN DEFAULT TRUE, -- 1:00-5:00
    evening_slot_available BOOLEAN DEFAULT FALSE, -- 6:00-8:00
    
    -- Special Conditions
    is_holiday BOOLEAN DEFAULT FALSE,
    is_blackout_date BOOLEAN DEFAULT FALSE, -- Admin-controlled unavailable dates
    special_notes TEXT DEFAULT NULL,
    
    -- Weather/External Factors
    weather_condition VARCHAR(100) DEFAULT NULL,
    delivery_conditions TEXT DEFAULT NULL,
    
    -- Admin Controls
    set_by_admin_id INT DEFAULT NULL,
    admin_notes TEXT DEFAULT NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (set_by_admin_id) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_calendar_date (calendar_date),
    INDEX idx_is_available (is_available),
    INDEX idx_is_blackout_date (is_blackout_date)
);

-- 6. Delivery Analytics Table
-- Tracks delivery performance metrics
CREATE TABLE IF NOT EXISTS delivery_analytics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    analytics_date DATE NOT NULL,
    
    -- Daily Metrics
    total_deliveries_scheduled INT DEFAULT 0,
    total_deliveries_completed INT DEFAULT 0,
    total_deliveries_failed INT DEFAULT 0,
    
    -- Performance Metrics
    average_delivery_time DECIMAL(5,2) DEFAULT NULL, -- in hours
    on_time_delivery_rate DECIMAL(5,2) DEFAULT NULL, -- percentage
    customer_satisfaction_score DECIMAL(3,2) DEFAULT NULL, -- out of 5.0
    
    -- Order Type Breakdown
    regular_orders_delivered INT DEFAULT 0,
    custom_orders_delivered INT DEFAULT 0,
    
    -- Financial Metrics
    total_delivery_revenue DECIMAL(12,2) DEFAULT 0.00,
    total_delivery_costs DECIMAL(12,2) DEFAULT 0.00,
    delivery_profit DECIMAL(12,2) DEFAULT 0.00,
    
    -- Geographic Distribution
    local_deliveries INT DEFAULT 0,
    regional_deliveries INT DEFAULT 0,
    express_deliveries INT DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Unique constraint
    UNIQUE KEY unique_analytics_date (analytics_date),
    
    -- Indexes
    INDEX idx_analytics_date (analytics_date)
);

-- 7. Insert sample delivery calendar data (next 90 days)
INSERT IGNORE INTO delivery_calendar (calendar_date, is_available, max_deliveries)
SELECT 
    DATE_ADD(CURDATE(), INTERVAL seq DAY) as calendar_date,
    CASE 
        WHEN DAYOFWEEK(DATE_ADD(CURDATE(), INTERVAL seq DAY)) IN (1, 7) THEN FALSE -- Sunday = 1, Saturday = 7
        ELSE TRUE 
    END as is_available,
    CASE 
        WHEN DAYOFWEEK(DATE_ADD(CURDATE(), INTERVAL seq DAY)) IN (1, 7) THEN 0
        ELSE 50 
    END as max_deliveries
FROM (
    SELECT 0 as seq UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL
    SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL
    SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12 UNION ALL SELECT 13 UNION ALL SELECT 14 UNION ALL
    SELECT 15 UNION ALL SELECT 16 UNION ALL SELECT 17 UNION ALL SELECT 18 UNION ALL SELECT 19 UNION ALL
    SELECT 20 UNION ALL SELECT 21 UNION ALL SELECT 22 UNION ALL SELECT 23 UNION ALL SELECT 24 UNION ALL
    SELECT 25 UNION ALL SELECT 26 UNION ALL SELECT 27 UNION ALL SELECT 28 UNION ALL SELECT 29 UNION ALL
    SELECT 30 UNION ALL SELECT 31 UNION ALL SELECT 32 UNION ALL SELECT 33 UNION ALL SELECT 34 UNION ALL
    SELECT 35 UNION ALL SELECT 36 UNION ALL SELECT 37 UNION ALL SELECT 38 UNION ALL SELECT 39 UNION ALL
    SELECT 40 UNION ALL SELECT 41 UNION ALL SELECT 42 UNION ALL SELECT 43 UNION ALL SELECT 44 UNION ALL
    SELECT 45 UNION ALL SELECT 46 UNION ALL SELECT 47 UNION ALL SELECT 48 UNION ALL SELECT 49 UNION ALL
    SELECT 50 UNION ALL SELECT 51 UNION ALL SELECT 52 UNION ALL SELECT 53 UNION ALL SELECT 54 UNION ALL
    SELECT 55 UNION ALL SELECT 56 UNION ALL SELECT 57 UNION ALL SELECT 58 UNION ALL SELECT 59 UNION ALL
    SELECT 60 UNION ALL SELECT 61 UNION ALL SELECT 62 UNION ALL SELECT 63 UNION ALL SELECT 64 UNION ALL
    SELECT 65 UNION ALL SELECT 66 UNION ALL SELECT 67 UNION ALL SELECT 68 UNION ALL SELECT 69 UNION ALL
    SELECT 70 UNION ALL SELECT 71 UNION ALL SELECT 72 UNION ALL SELECT 73 UNION ALL SELECT 74 UNION ALL
    SELECT 75 UNION ALL SELECT 76 UNION ALL SELECT 77 UNION ALL SELECT 78 UNION ALL SELECT 79 UNION ALL
    SELECT 80 UNION ALL SELECT 81 UNION ALL SELECT 82 UNION ALL SELECT 83 UNION ALL SELECT 84 UNION ALL
    SELECT 85 UNION ALL SELECT 86 UNION ALL SELECT 87 UNION ALL SELECT 88 UNION ALL SELECT 89
) as numbers
WHERE seq < 90;
