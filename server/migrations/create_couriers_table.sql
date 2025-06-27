-- Create couriers table for managing delivery personnel
CREATE TABLE IF NOT EXISTS couriers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  email VARCHAR(100) UNIQUE,
  license_number VARCHAR(50),
  vehicle_type ENUM('motorcycle', 'car', 'van', 'truck') DEFAULT 'motorcycle',
  status ENUM('active', 'inactive', 'busy', 'offline') DEFAULT 'active',
  max_deliveries_per_day INT DEFAULT 10,
  service_areas TEXT, -- JSON array of areas they cover
  rating DECIMAL(3,2) DEFAULT 5.00,
  total_deliveries INT DEFAULT 0,
  successful_deliveries INT DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_status (status),
  INDEX idx_phone (phone_number),
  INDEX idx_email (email)
);

-- Update delivery_schedules table to include courier_id reference
ALTER TABLE delivery_schedules 
ADD COLUMN courier_id INT NULL AFTER courier_name,
ADD INDEX idx_courier_id (courier_id),
ADD FOREIGN KEY (courier_id) REFERENCES couriers(id) ON DELETE SET NULL;

-- Create courier_delivery_history table for tracking
CREATE TABLE IF NOT EXISTS courier_delivery_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  courier_id INT NOT NULL,
  delivery_schedule_id INT NOT NULL,
  pickup_time DATETIME,
  delivery_time DATETIME,
  status ENUM('assigned', 'picked_up', 'in_transit', 'delivered', 'failed', 'cancelled') DEFAULT 'assigned',
  delivery_notes TEXT,
  customer_rating INT CHECK (customer_rating >= 1 AND customer_rating <= 5),
  customer_feedback TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (courier_id) REFERENCES couriers(id) ON DELETE CASCADE,
  FOREIGN KEY (delivery_schedule_id) REFERENCES delivery_schedules(id) ON DELETE CASCADE,
  INDEX idx_courier_id (courier_id),
  INDEX idx_delivery_schedule_id (delivery_schedule_id),
  INDEX idx_status (status)
);
