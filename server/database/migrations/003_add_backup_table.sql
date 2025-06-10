CREATE TABLE backup_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    backup_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    backup_file_path VARCHAR(255) NOT NULL,
    backup_type ENUM('manual', 'scheduled', 'emergency') DEFAULT 'manual',
    backup_size BIGINT COMMENT 'Size in bytes',
    restored_at TIMESTAMP NULL,
    restored_by INT NULL,
    created_by INT NOT NULL,
    status ENUM('active', 'restored', 'archived') DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (restored_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_backup_date (backup_date),
    INDEX idx_backup_status (status),
    INDEX idx_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;