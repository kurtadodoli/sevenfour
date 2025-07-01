const mysql = require('mysql2/promise');

// Use the same config as app.js
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'seven_four_clothing',
  charset: 'utf8mb4'
};

async function createCancellationTable() {
  try {
    console.log('=== Creating cancellation_requests table ===');
    console.log('Using config:', {
      host: dbConfig.host,
      user: dbConfig.user,
      database: dbConfig.database
    });
    
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');
    
    // Create the table without foreign key constraints first
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS cancellation_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        user_id INT NOT NULL,
        reason TEXT NOT NULL,
        status ENUM('pending', 'approved', 'denied') DEFAULT 'pending',
        requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        processed_at TIMESTAMP NULL,
        processed_by INT NULL,
        admin_notes TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_order_id (order_id),
        INDEX idx_user_id (user_id),
        INDEX idx_status (status),
        INDEX idx_requested_at (requested_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    
    console.log('✅ cancellation_requests table created successfully');
    
    // Verify the table
    const [tables] = await connection.execute("SHOW TABLES LIKE 'cancellation_requests'");
    console.log('Table exists:', tables.length > 0);
    
    if (tables.length > 0) {
      const [columns] = await connection.execute('DESCRIBE cancellation_requests');
      console.log('Table structure:');
      columns.forEach(col => {
        console.log(`  - ${col.Field}: ${col.Type}${col.Key ? ` (${col.Key})` : ''}`);
      });
    }
    
    await connection.end();
    console.log('✅ Done');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createCancellationTable();
