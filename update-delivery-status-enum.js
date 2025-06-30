const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing'
};

async function updateDeliveryStatusEnum() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    console.log('🔧 Updating delivery_status enum to include "cancelled"...');
    await connection.execute(`
      ALTER TABLE custom_orders 
      MODIFY COLUMN delivery_status ENUM('pending', 'scheduled', 'in_transit', 'delivered', 'delayed', 'cancelled') DEFAULT 'pending'
    `);
    
    console.log('✅ Updated delivery_status enum successfully');

    // Verify the change
    const [columns] = await connection.execute(`
      SHOW COLUMNS FROM custom_orders WHERE Field = 'delivery_status'
    `);
    
    console.log('📋 Updated delivery_status column:');
    console.log(`  Type: ${columns[0].Type}`);

  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

updateDeliveryStatusEnum();
