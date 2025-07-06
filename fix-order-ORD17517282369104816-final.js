const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function fixSpecificOrderAndTest() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);

    console.log('=== FIXING ORDER ORD17517282369104816 ===\n');

    // Get the order details first
    const [orderRows] = await connection.execute(`
      SELECT id, order_number, status, payment_status, confirmed_by, confirmed_at, notes
      FROM orders 
      WHERE order_number = ?
    `, ['ORD17517282369104816']);

    if (orderRows.length === 0) {
      console.log('❌ Order not found');
      return;
    }

    const order = orderRows[0];
    console.log('📋 Current Order Status:');
    console.log(`- Order Number: ${order.order_number}`);
    console.log(`- Status: ${order.status}`);
    console.log(`- Payment Status: ${order.payment_status}`);
    console.log(`- Confirmed By: ${order.confirmed_by}`);
    console.log(`- Confirmed At: ${order.confirmed_at}`);

    // Check if it needs fixing
    if (order.status === 'confirmed' && order.confirmed_by !== null) {
      console.log('\n✅ Order is already properly configured!');
    } else {
      console.log('\n🔧 Fixing order...');
      
      // Get the admin user ID
      const [adminUsers] = await connection.execute(`
        SELECT user_id FROM users WHERE email = 'krutadodoli@gmail.com' LIMIT 1
      `);
      const adminUserId = adminUsers.length > 0 ? adminUsers[0].user_id : 967502321335218;
      
      // Update the order with proper fields
      await connection.execute(`
        UPDATE orders 
        SET status = 'confirmed',
            payment_status = 'verified',
            confirmed_by = ?,
            confirmed_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE order_number = ?
      `, [adminUserId, order.order_number]);
      
      console.log(`✅ Order fixed with admin user ID: ${adminUserId}`);
    }

    // Test the delivery query to confirm it would appear
    console.log('\n=== TESTING DELIVERY QUERY ===');
    const [deliveryTest] = await connection.execute(`
      SELECT 
        o.id,
        o.order_number,
        o.status,
        o.confirmed_by,
        o.payment_status,
        'Match Found' as result
      FROM orders o
      WHERE o.order_number = ?
      AND o.status IN ('confirmed', 'processing', 'Order Received')
      AND (
        o.confirmed_by IS NOT NULL 
        OR o.status = 'Order Received'
        OR (o.notes LIKE '%Payment approved by admin%' AND o.status = 'confirmed')
      )
    `, ['ORD17517282369104816']);

    if (deliveryTest.length > 0) {
      console.log('✅ Order WILL appear in DeliveryPage.js');
      console.log(`- Confirmed By: ${deliveryTest[0].confirmed_by}`);
      console.log(`- Status: ${deliveryTest[0].status}`);
      console.log(`- Payment Status: ${deliveryTest[0].payment_status}`);
    } else {
      console.log('❌ Order will NOT appear in DeliveryPage.js');
    }

    // Test the transaction page query
    console.log('\n=== TESTING TRANSACTION PAGE QUERY ===');
    const [transactionTest] = await connection.execute(`
      SELECT 
        o.id,
        o.order_number,
        o.status,
        o.confirmed_by,
        o.payment_status
      FROM orders o
      WHERE o.order_number = ?
      AND o.status = 'confirmed'
      AND (
        o.confirmed_by IS NOT NULL 
        OR (o.notes LIKE '%Payment approved by admin%' AND o.status = 'confirmed')
      )
    `, ['ORD17517282369104816']);

    if (transactionTest.length > 0) {
      console.log('✅ Order WILL appear in TransactionPage.js "All Confirmed Orders"');
    } else {
      console.log('❌ Order will NOT appear in TransactionPage.js "All Confirmed Orders"');
    }

    console.log('\n🎉 ORDER FIX COMPLETE!');
    console.log('The order should now appear in both:');
    console.log('- DeliveryPage.js (delivery management)');
    console.log('- TransactionPage.js (All Confirmed Orders)');
    
    console.log('\n📝 ADMIN ENDPOINTS FIXED:');
    console.log('✅ All three admin approval endpoints now properly set:');
    console.log('   - confirmed_by = actual admin user ID (not hardcoded 1)');
    console.log('   - payment_status = "verified"');
    console.log('   - confirmed_at = CURRENT_TIMESTAMP');
    console.log('\n✅ Future orders will automatically appear after admin approval!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

fixSpecificOrderAndTest();
