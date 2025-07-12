const mysql = require('mysql2/promise');
const { dbConfig } = require('./config/db');

(async () => {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    const [tables] = await connection.execute('SHOW TABLES LIKE "custom_order_cancellation_requests"');
    console.log('Custom order cancellation requests table exists:', tables.length > 0);
    
    if (tables.length === 0) {
      console.log('Creating table...');
      await connection.execute(`
        CREATE TABLE custom_order_cancellation_requests (
          id INT AUTO_INCREMENT PRIMARY KEY,
          custom_order_id VARCHAR(255) NOT NULL,
          user_id INT NOT NULL,
          reason TEXT NOT NULL,
          status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
          admin_notes TEXT,
          processed_at TIMESTAMP NULL,
          processed_by INT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_custom_order_id (custom_order_id),
          INDEX idx_user_id (user_id),
          INDEX idx_status (status)
        )
      `);
      console.log('Table created successfully');
    }
    
    await connection.end();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error:', error);
    await connection.end();
  }
})();
