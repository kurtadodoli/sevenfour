// Test script to verify cancellation request functionality
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing',
  port: 3306
};

async function testCancellationRequestFeature() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected');

    // Check if cancellation_requests table exists
    const [tables] = await connection.execute("SHOW TABLES LIKE 'cancellation_requests'");
    if (tables.length === 0) {
      console.log('❌ cancellation_requests table does not exist');
      console.log('Creating cancellation_requests table...');
      
      await connection.execute(`
        CREATE TABLE cancellation_requests (
          id INT AUTO_INCREMENT PRIMARY KEY,
          order_id INT NOT NULL,
          user_id INT NOT NULL,
          order_number VARCHAR(50) NOT NULL,
          reason TEXT NOT NULL,
          status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
          admin_notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
        )
      `);
      console.log('✅ cancellation_requests table created');
    } else {
      console.log('✅ cancellation_requests table exists');
    }

    // Check table structure
    const [columns] = await connection.execute("DESCRIBE cancellation_requests");
    console.log('📋 Cancellation requests table structure:');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : ''}`);
    });

    // Check for any existing cancellation requests
    const [requests] = await connection.execute('SELECT COUNT(*) as total FROM cancellation_requests');
    console.log(`📊 Current cancellation requests: ${requests[0].total}`);

    // Test the modified getUserOrders query
    console.log('\n🔍 Testing modified getUserOrders query...');
    const [testQuery] = await connection.execute(`
      SELECT 
        o.id,
        o.order_number,
        o.status,
        o.user_id,
        cr.status as cancellation_status,
        cr.reason as cancellation_reason,
        cr.created_at as cancellation_requested_at
      FROM orders o
      LEFT JOIN cancellation_requests cr ON o.id = cr.order_id AND cr.status = 'pending'
      LIMIT 5
    `);
    
    console.log(`Found ${testQuery.length} orders in test query:`);
    testQuery.forEach(order => {
      console.log(`  Order ${order.order_number}: status=${order.status}, cancellation_status=${order.cancellation_status || 'none'}`);
    });

    console.log('\n✅ Cancellation request feature test completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testCancellationRequestFeature();
