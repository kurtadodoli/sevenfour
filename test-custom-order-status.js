const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing'
};

async function testCustomOrderStatus() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    // First, check the orders table structure
    console.log('\n📋 Checking orders table structure...');
    const [columns] = await connection.execute(`
      DESCRIBE orders
    `);
    
    console.log('Orders table columns:');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'nullable' : 'not null'})`);
    });

    // Check for any existing orders
    console.log('\n📋 Checking existing orders...');
    const [existingOrders] = await connection.execute(`
      SELECT id, order_number, user_id, status, total_amount, shipping_address, created_at
      FROM orders 
      ORDER BY created_at DESC
      LIMIT 10
    `);
    
    if (existingOrders.length > 0) {
      console.log(`Found ${existingOrders.length} existing orders:`);
      existingOrders.forEach(order => {
        console.log(`  - Order #${order.order_number} (ID: ${order.id}) - Status: ${order.status || 'pending'} - User: ${order.user_id} - Amount: ₱${order.total_amount}`);
      });
    } else {
      console.log('No existing orders found.');
    }

  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testCustomOrderStatus();
