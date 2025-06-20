const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function createCancellationRequestsTable() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS cancellation_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        user_id BIGINT NOT NULL,
        order_number VARCHAR(50) NOT NULL,
        reason TEXT NOT NULL,
        status ENUM('pending', 'approved', 'denied') DEFAULT 'pending',
        admin_notes TEXT,
        processed_by BIGINT NULL,
        processed_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (processed_by) REFERENCES users(user_id) ON DELETE SET NULL,
        
        INDEX idx_order_id (order_id),
        INDEX idx_user_id (user_id),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
      )
    `);
    
    console.log('✅ Cancellation requests table created successfully');
    
    await connection.end();
  } catch (error) {
    console.error('❌ Error creating table:', error);
  }
}

createCancellationRequestsTable();
