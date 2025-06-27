-- Simplified Database Schema for DeliveryPage.js
-- This script creates the core tables needed for delivery management

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS delivery_status_history;
DROP TABLE IF EXISTS delivery_schedules;
DROP TABLE IF EXISTS delivery_calendar;
DROP TABLE IF EXISTS couriers;

-- =============================================
-- 1. COURIERS TABLE
-- =============================================
CREATE TABLE couriers (
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
    service_areas JSON,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- 2. DELIVERY CALENDAR TABLE
-- =============================================
CREATE TABLE delivery_calendar (
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
    
    UNIQUE KEY unique_date (calendar_date)
);

-- =============================================
-- 3. DELIVERY SCHEDULES TABLE
-- =============================================
CREATE TABLE delivery_schedules (
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (courier_id) REFERENCES couriers(id) ON DELETE SET NULL
);

-- =============================================
-- 4. DELIVERY STATUS HISTORY TABLE
-- =============================================
CREATE TABLE delivery_status_history (
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
    
    FOREIGN KEY (delivery_schedule_id) REFERENCES delivery_schedules(id) ON DELETE CASCADE
);

-- =============================================
-- 5. INSERT SAMPLE DATA
-- =============================================

-- Insert sample couriers
INSERT INTO couriers (name, email, phone_number, vehicle_type, service_areas) VALUES
('Juan Dela Cruz', 'juan@sfc-courier.com', '+63 917 123 4567', 'motorcycle', '["Manila", "Quezon City", "Makati", "Pasig"]'),
('Maria Santos', 'maria@sfc-courier.com', '+63 918 234 5678', 'car', '["Taguig", "Muntinlupa", "Parañaque", "Las Piñas"]'),
('Pedro Rodriguez', 'pedro@sfc-courier.com', '+63 919 345 6789', 'van', '["Marikina", "Pasay", "Caloocan", "Malabon"]'),
('Ana Garcia', 'ana@sfc-courier.com', '+63 920 456 7890', 'motorcycle', '["Navotas", "Valenzuela", "San Juan", "Mandaluyong"]');

-- Initialize calendar for next 90 days
INSERT INTO delivery_calendar (calendar_date, is_weekend, is_holiday) VALUES
(CURDATE(), FALSE, FALSE),
(DATE_ADD(CURDATE(), INTERVAL 1 DAY), FALSE, FALSE),
(DATE_ADD(CURDATE(), INTERVAL 2 DAY), FALSE, FALSE),
(DATE_ADD(CURDATE(), INTERVAL 3 DAY), FALSE, FALSE),
(DATE_ADD(CURDATE(), INTERVAL 4 DAY), FALSE, FALSE),
(DATE_ADD(CURDATE(), INTERVAL 5 DAY), FALSE, FALSE),
(DATE_ADD(CURDATE(), INTERVAL 6 DAY), TRUE, FALSE),
(DATE_ADD(CURDATE(), INTERVAL 7 DAY), TRUE, FALSE);

-- Add more days (up to 30 days for now)
INSERT INTO delivery_calendar (calendar_date, is_weekend, is_holiday) VALUES
(DATE_ADD(CURDATE(), INTERVAL 8 DAY), FALSE, FALSE),
(DATE_ADD(CURDATE(), INTERVAL 9 DAY), FALSE, FALSE),
(DATE_ADD(CURDATE(), INTERVAL 10 DAY), FALSE, FALSE),
(DATE_ADD(CURDATE(), INTERVAL 11 DAY), FALSE, FALSE),
(DATE_ADD(CURDATE(), INTERVAL 12 DAY), FALSE, FALSE),
(DATE_ADD(CURDATE(), INTERVAL 13 DAY), TRUE, FALSE),
(DATE_ADD(CURDATE(), INTERVAL 14 DAY), TRUE, FALSE),
(DATE_ADD(CURDATE(), INTERVAL 15 DAY), FALSE, FALSE),
(DATE_ADD(CURDATE(), INTERVAL 16 DAY), FALSE, FALSE),
(DATE_ADD(CURDATE(), INTERVAL 17 DAY), FALSE, FALSE),
(DATE_ADD(CURDATE(), INTERVAL 18 DAY), FALSE, FALSE),
(DATE_ADD(CURDATE(), INTERVAL 19 DAY), FALSE, FALSE),
(DATE_ADD(CURDATE(), INTERVAL 20 DAY), TRUE, FALSE),
(DATE_ADD(CURDATE(), INTERVAL 21 DAY), TRUE, FALSE),
(DATE_ADD(CURDATE(), INTERVAL 22 DAY), FALSE, FALSE),
(DATE_ADD(CURDATE(), INTERVAL 23 DAY), FALSE, FALSE),
(DATE_ADD(CURDATE(), INTERVAL 24 DAY), FALSE, FALSE),
(DATE_ADD(CURDATE(), INTERVAL 25 DAY), FALSE, FALSE),
(DATE_ADD(CURDATE(), INTERVAL 26 DAY), FALSE, FALSE),
(DATE_ADD(CURDATE(), INTERVAL 27 DAY), TRUE, FALSE),
(DATE_ADD(CURDATE(), INTERVAL 28 DAY), TRUE, FALSE),
(DATE_ADD(CURDATE(), INTERVAL 29 DAY), FALSE, FALSE),
(DATE_ADD(CURDATE(), INTERVAL 30 DAY), FALSE, FALSE);

-- =============================================
-- 6. CREATE INDEXES
-- =============================================
CREATE INDEX idx_delivery_schedules_date ON delivery_schedules(delivery_date);
CREATE INDEX idx_delivery_schedules_status ON delivery_schedules(delivery_status);
CREATE INDEX idx_delivery_schedules_order ON delivery_schedules(order_id, order_type);
CREATE INDEX idx_delivery_calendar_date ON delivery_calendar(calendar_date);
CREATE INDEX idx_couriers_active ON couriers(is_active);

SELECT 'Delivery management database schema created successfully!' as status;
