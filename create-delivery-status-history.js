const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function createDeliveryStatusHistoryTable() {
  let connection;
  try {
    console.log('🔗 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    
    // Check if delivery_status_history table exists
    console.log('📋 Checking delivery_status_history table...');
    try {
      const [result] = await connection.execute("SHOW TABLES LIKE 'delivery_status_history'");
      if (result.length === 0) {
        console.log('❌ delivery_status_history table does not exist!');
        
        // Create the table
        console.log('🔨 Creating delivery_status_history table...');
        await connection.execute(`
          CREATE TABLE delivery_status_history (
            id INT AUTO_INCREMENT PRIMARY KEY,
            delivery_schedule_id INT,
            order_id VARCHAR(255),
            previous_status VARCHAR(50),
            new_status VARCHAR(50),
            status_notes TEXT,
            changed_by_user_id INT,
            changed_by_name VARCHAR(255),
            location_address TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_delivery_schedule_id (delivery_schedule_id),
            INDEX idx_order_id (order_id),
            INDEX idx_created_at (created_at)
          )
        `);
        console.log('✅ delivery_status_history table created successfully!');
      } else {
        console.log('✅ delivery_status_history table exists');
      }
    } catch (error) {
      console.error('❌ Error with delivery_status_history table:', error.message);
    }
    
    console.log('🎉 delivery_status_history table check completed!');
    
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createDeliveryStatusHistoryTable();
