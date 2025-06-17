-- Create inventory_settings table for critical level configuration
CREATE TABLE IF NOT EXISTS inventory_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    critical_level INT DEFAULT 10,
    low_stock_level INT DEFAULT 20,
    max_stock_level INT DEFAULT 100,
    reorder_point INT DEFAULT 15,
    reorder_quantity INT DEFAULT 50,
    supplier_info TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    UNIQUE KEY unique_product (product_id)
);

-- Create stock_movements table for tracking stock changes
CREATE TABLE IF NOT EXISTS stock_movements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    movement_type ENUM('IN', 'OUT', 'ADJUSTMENT', 'RETURN') NOT NULL,
    quantity INT NOT NULL,
    size VARCHAR(10),
    reason VARCHAR(255),
    reference_number VARCHAR(100),
    user_id BIGINT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Create stock_alerts table for tracking alerts
CREATE TABLE IF NOT EXISTS stock_alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    alert_type ENUM('CRITICAL', 'LOW_STOCK', 'OUT_OF_STOCK') NOT NULL,
    alert_level INT NOT NULL,
    current_stock INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    acknowledged_by BIGINT,
    acknowledged_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (acknowledged_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Create inventory_reports table for storing report snapshots
CREATE TABLE IF NOT EXISTS inventory_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_type VARCHAR(50) NOT NULL,
    report_data JSON,
    generated_by BIGINT,
    file_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (generated_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Insert default inventory settings for existing products
INSERT IGNORE INTO inventory_settings (product_id, critical_level, low_stock_level, max_stock_level)
SELECT product_id, 10, 20, 100 FROM products;

-- Create indexes for better performance
CREATE INDEX idx_stock_movements_product_date ON stock_movements(product_id, created_at);
CREATE INDEX idx_stock_alerts_product_active ON stock_alerts(product_id, is_active);
CREATE INDEX idx_inventory_settings_product ON inventory_settings(product_id);
