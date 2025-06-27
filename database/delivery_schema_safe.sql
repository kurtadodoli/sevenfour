-- Safe Database Schema for DeliveryPage.js
-- This script creates tables only if they don't exist

-- =============================================
-- 1. COURIERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS couriers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone_number VARCHAR(20) NOT NULL,
    vehicle_type ENUM('motorcycle', 'car', 'van', 'truck') NOT NULL,
    license_number VARCHAR(50),
    total_deliveries INT DEFAULT 0,
    successful_deliveries INT DEFAULT 0,
    failed_deliveries INT DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    max_daily_deliveries INT DEFAULT 10,
    working_hours_start TIME DEFAULT '08:00:00',
    working_hours_end TIME DEFAULT '18:00:00',
    service_areas JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- 2. DELIVERY CALENDAR TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS delivery_calendar (
    id INT PRIMARY KEY AUTO_INCREMENT,
    calendar_date DATE NOT NULL UNIQUE,
    max_deliveries INT DEFAULT 20,
    current_bookings INT DEFAULT 0,
    is_available BOOLEAN DEFAULT TRUE,
    is_holiday BOOLEAN DEFAULT FALSE,
    is_weekend BOOLEAN DEFAULT FALSE,
    special_notes TEXT,
    weather_status ENUM('good', 'rainy', 'stormy', 'extreme') DEFAULT 'good',
    delivery_restrictions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- 3. ENHANCED DELIVERY SCHEDULES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS delivery_schedules_new (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    order_number VARCHAR(50) NOT NULL,
    order_type ENUM('regular', 'custom_design', 'custom_order') DEFAULT 'regular',
    
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
    calendar_color VARCHAR(7) DEFAULT '#007bff',
    display_icon VARCHAR(50) DEFAULT '📦',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- 4. DELIVERY STATUS HISTORY TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS delivery_status_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    delivery_schedule_id INT NOT NULL,
    order_id INT NOT NULL,
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    status_notes TEXT,
    changed_by_user_id INT,
    changed_by_name VARCHAR(255),
    location_lat DECIMAL(10,8),
    location_lng DECIMAL(11,8),
    location_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 5. INSERT SAMPLE DATA (only if empty)
-- =============================================

-- Insert sample couriers (only if table is empty)
INSERT INTO couriers (name, email, phone_number, vehicle_type, service_areas) 
SELECT * FROM (
    SELECT 'Juan Dela Cruz' as name, 'juan@sfc-courier.com' as email, '+63 917 123 4567' as phone_number, 'motorcycle' as vehicle_type, '["Manila", "Quezon City", "Makati", "Pasig"]' as service_areas
    UNION ALL
    SELECT 'Maria Santos', 'maria@sfc-courier.com', '+63 918 234 5678', 'car', '["Taguig", "Muntinlupa", "Parañaque", "Las Piñas"]'
    UNION ALL
    SELECT 'Pedro Rodriguez', 'pedro@sfc-courier.com', '+63 919 345 6789', 'van', '["Marikina", "Pasay", "Caloocan", "Malabon"]'
    UNION ALL
    SELECT 'Ana Garcia', 'ana@sfc-courier.com', '+63 920 456 7890', 'motorcycle', '["Navotas", "Valenzuela", "San Juan", "Mandaluyong"]'
) tmp
WHERE NOT EXISTS (SELECT 1 FROM couriers LIMIT 1);

-- Initialize calendar for next 30 days (only if empty)
INSERT INTO delivery_calendar (calendar_date, is_weekend, is_holiday)
SELECT 
    DATE_ADD(CURDATE(), INTERVAL n DAY) as calendar_date,
    CASE WHEN DAYOFWEEK(DATE_ADD(CURDATE(), INTERVAL n DAY)) IN (1,7) THEN TRUE ELSE FALSE END as is_weekend,
    FALSE as is_holiday
FROM (
    SELECT 0 as n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 
    UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9
    UNION ALL SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12 UNION ALL SELECT 13 UNION ALL SELECT 14
    UNION ALL SELECT 15 UNION ALL SELECT 16 UNION ALL SELECT 17 UNION ALL SELECT 18 UNION ALL SELECT 19
    UNION ALL SELECT 20 UNION ALL SELECT 21 UNION ALL SELECT 22 UNION ALL SELECT 23 UNION ALL SELECT 24
    UNION ALL SELECT 25 UNION ALL SELECT 26 UNION ALL SELECT 27 UNION ALL SELECT 28 UNION ALL SELECT 29
) numbers
WHERE NOT EXISTS (SELECT 1 FROM delivery_calendar WHERE calendar_date = DATE_ADD(CURDATE(), INTERVAL n DAY));

SELECT 'Delivery management database schema created successfully!' as status;
