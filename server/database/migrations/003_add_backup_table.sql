-- Create backup_history table
CREATE TABLE backup_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    backup_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    backup_file_path VARCHAR(255) NOT NULL,
    restored_at TIMESTAMP NULL,
    restored_by INT NULL,
    created_by INT NOT NULL,
    status ENUM('active', 'restored', 'archived') DEFAULT 'active',
    FOREIGN KEY (restored_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id)
);
