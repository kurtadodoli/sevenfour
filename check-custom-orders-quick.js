const mysql = require('mysql2/promise');

async function checkCustomOrders() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 's3v3n-f0ur-cl0thing*',
    database: 'seven_four_clothing'
  });

  try {
    // Check custom orders table
    const [customOrders] = await connection.execute(
      'SELECT id, custom_order_id, product_name, product_type, status, customer_name, customer_email, estimated_price, final_price, created_at FROM custom_orders ORDER BY created_at DESC LIMIT 10'
    );
    
    console.log('🎨 Custom Orders:');
    console.log(`Total: ${customOrders.length}`);
    
    customOrders.forEach(order => {
      console.log(`  - ID: ${order.id} | Order ID: ${order.custom_order_id} | Status: ${order.status}`);
      console.log(`    Product: ${order.product_name} (${order.product_type})`);
      console.log(`    Customer: ${order.customer_name} | Email: ${order.customer_email}`);
      console.log(`    Price: $${order.estimated_price || order.final_price || 0}`);
      console.log(`    Created: ${order.created_at}`);
      console.log('');
    });
    
    // Count by status
    const [statusCounts] = await connection.execute(
      'SELECT status, COUNT(*) as count FROM custom_orders GROUP BY status'
    );
    
    console.log('📊 Custom Orders by Status:');
    statusCounts.forEach(stat => {
      console.log(`  - ${stat.status}: ${stat.count}`);
    });
    
    // Check if we have any approved ones
    const [approvedOrders] = await connection.execute(
      'SELECT COUNT(*) as count FROM custom_orders WHERE status = "approved"'
    );
    
    console.log(`\n✅ Approved orders: ${approvedOrders[0].count}`);
    
    if (approvedOrders[0].count === 0) {
      console.log('\n💡 No approved custom orders found. Creating a test approved order...');
      
      // Check if there are any pending orders we can approve
      const [pendingOrders] = await connection.execute(
        'SELECT id FROM custom_orders WHERE status = "pending" LIMIT 1'
      );
      
      if (pendingOrders.length > 0) {
        await connection.execute(
          'UPDATE custom_orders SET status = "approved", updated_at = NOW() WHERE id = ?',
          [pendingOrders[0].id]
        );
        console.log(`✅ Approved custom order ID: ${pendingOrders[0].id}`);
      } else {
        console.log('No pending orders to approve. You may need to create test data.');
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking custom orders:', error.message);
  } finally {
    await connection.end();
  }
}

checkCustomOrders();
