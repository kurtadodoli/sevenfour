// Test script to create a test cancellation request and verify the UI behavior
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing',
  port: 3306
};

async function createTestCancellationRequest() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected');

    // Find an order that can be cancelled
    const [orders] = await connection.execute(`
      SELECT o.id, o.order_number, o.status, o.user_id, cr.status as cancellation_status
      FROM orders o
      LEFT JOIN cancellation_requests cr ON o.id = cr.order_id AND cr.status = 'pending'
      WHERE o.status IN ('pending', 'confirmed', 'processing') 
        AND cr.id IS NULL
      LIMIT 1
    `);

    if (orders.length === 0) {
      console.log('❌ No cancellable orders found without existing cancellation requests');
      
      // Show existing orders and their statuses
      const [allOrders] = await connection.execute(`
        SELECT o.id, o.order_number, o.status, o.user_id, 
               cr.status as cancellation_status, cr.reason
        FROM orders o
        LEFT JOIN cancellation_requests cr ON o.id = cr.order_id AND cr.status = 'pending'
        ORDER BY o.order_date DESC
        LIMIT 5
      `);
      
      console.log('\n📋 Recent orders status:');
      allOrders.forEach(order => {
        const cancellationInfo = order.cancellation_status ? ` (Cancellation: ${order.cancellation_status})` : '';
        console.log(`  Order ${order.order_number}: ${order.status}${cancellationInfo}`);
      });
      
      return;
    }

    const order = orders[0];
    console.log(`\n🎯 Found cancellable order: ${order.order_number} (status: ${order.status})`);

    // Create a test cancellation request
    const [result] = await connection.execute(`
      INSERT INTO cancellation_requests (
        order_id, user_id, order_number, reason, status
      ) VALUES (?, ?, ?, ?, 'pending')
    `, [
      order.id, 
      order.user_id, 
      order.order_number, 
      'Test cancellation request for UI testing'
    ]);

    console.log(`✅ Created test cancellation request (ID: ${result.insertId})`);

    // Verify the order now shows cancellation status
    const [updatedOrder] = await connection.execute(`
      SELECT o.id, o.order_number, o.status, 
             cr.status as cancellation_status, cr.reason, cr.created_at as cancellation_requested_at
      FROM orders o
      LEFT JOIN cancellation_requests cr ON o.id = cr.order_id AND cr.status = 'pending'
      WHERE o.id = ?
    `, [order.id]);

    if (updatedOrder.length > 0 && updatedOrder[0].cancellation_status) {
      console.log(`✅ Order ${updatedOrder[0].order_number} now shows cancellation_status: ${updatedOrder[0].cancellation_status}`);
      console.log(`📝 Reason: ${updatedOrder[0].reason}`);
      console.log('\n🎉 Test successful! This order should now show "Cancellation Requested" in the UI instead of a Cancel button.');
    } else {
      console.log('❌ Failed to verify cancellation request status');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createTestCancellationRequest();
