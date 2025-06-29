const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing'
};

async function removeIncorrectCustomOrder() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    const orderNumber = 'ORD17508699018537684';
    const customerName = 'kurt';

    console.log(`\n🔍 Searching for order ${orderNumber} in custom_orders table...`);
    
    // First, let's find the order to confirm it exists
    const [orders] = await connection.execute(`
      SELECT id, custom_order_id, customer_name, customer_email, product_type, 
             estimated_price, status, created_at 
      FROM custom_orders 
      WHERE custom_order_id = ? OR customer_name = ?
    `, [orderNumber, customerName]);

    if (orders.length === 0) {
      console.log('❌ Order not found in custom_orders table');
      
      // Let's also check if it might be stored differently
      console.log('\n🔍 Checking for similar orders...');
      const [similarOrders] = await connection.execute(`
        SELECT id, custom_order_id, customer_name, customer_email, estimated_price 
        FROM custom_orders 
        WHERE customer_name LIKE '%kurt%' OR custom_order_id LIKE '%${orderNumber.slice(-8)}%'
      `);
      
      if (similarOrders.length > 0) {
        console.log('📋 Found similar orders:');
        similarOrders.forEach(order => {
          console.log(`  - ID: ${order.id}, Order ID: ${order.custom_order_id}, Customer: ${order.customer_name}, Price: ₱${order.estimated_price}`);
        });
      } else {
        console.log('ℹ️ No similar orders found');
      }
      
      await connection.end();
      return;
    }

    console.log(`\n📋 Found ${orders.length} matching order(s):`);
    orders.forEach(order => {
      console.log(`  - ID: ${order.id}`);
      console.log(`  - Custom Order ID: ${order.custom_order_id}`);
      console.log(`  - Customer: ${order.customer_name}`);
      console.log(`  - Email: ${order.customer_email}`);
      console.log(`  - Product Type: ${order.product_type}`);
      console.log(`  - Price: ₱${order.estimated_price}`);
      console.log(`  - Status: ${order.status}`);
      console.log(`  - Created: ${order.created_at}`);
      console.log('  ---');
    });

    // Confirm this looks like the right order
    const targetOrder = orders.find(order => 
      order.custom_order_id === orderNumber || 
      (order.customer_name.toLowerCase() === customerName.toLowerCase() && order.estimated_price == 1500)
    );

    if (!targetOrder) {
      console.log('❌ Could not definitively identify the target order');
      await connection.end();
      return;
    }

    console.log(`\n🎯 Target order identified:`);
    console.log(`  - Database ID: ${targetOrder.id}`);
    console.log(`  - Order ID: ${targetOrder.custom_order_id}`);
    console.log(`  - Customer: ${targetOrder.customer_name}`);
    console.log(`  - Price: ₱${targetOrder.estimated_price}`);

    console.log(`\n🗑️ Removing order from custom_orders table...`);
    
    const [result] = await connection.execute(`
      DELETE FROM custom_orders WHERE id = ?
    `, [targetOrder.id]);

    if (result.affectedRows > 0) {
      console.log(`✅ Successfully removed order ${targetOrder.custom_order_id} from custom_orders table`);
      console.log(`📊 Rows deleted: ${result.affectedRows}`);
    } else {
      console.log('❌ No rows were deleted');
    }

    // Verify removal
    console.log('\n🔍 Verifying removal...');
    const [verifyOrders] = await connection.execute(`
      SELECT id FROM custom_orders WHERE id = ?
    `, [targetOrder.id]);

    if (verifyOrders.length === 0) {
      console.log('✅ Confirmed: Order has been completely removed from custom_orders table');
    } else {
      console.log('⚠️ Warning: Order still exists in custom_orders table');
    }

    console.log('\n✅ Operation completed successfully!');
    console.log('💡 Note: This was a regular order (ORD format) that should not have been in custom_orders table');

  } catch (error) {
    console.error('❌ Database error:', error.message);
    console.error('Full error:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

removeIncorrectCustomOrder();
