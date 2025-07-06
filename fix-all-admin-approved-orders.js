const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function fixAllAdminApprovedOrders() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    
    console.log('🔧 Fixing all admin-approved orders that are missing confirmed_by field...\n');
    
    // Find all orders that have been admin-approved but don't have confirmed_by set
    const [ordersToFix] = await connection.execute(`
      SELECT 
        id,
        order_number,
        status,
        payment_status,
        confirmed_by,
        notes,
        created_at
      FROM orders 
      WHERE status = 'confirmed'
      AND confirmed_by IS NULL
      AND notes LIKE '%Payment approved by admin%'
    `);
    
    console.log(`📋 Found ${ordersToFix.length} orders that need fixing:\n`);
    
    if (ordersToFix.length === 0) {
      console.log('✅ No orders need fixing - all confirmed orders have proper confirmed_by field!');
      return;
    }
    
    // List the orders
    ordersToFix.forEach(order => {
      console.log(`   - ${order.order_number}: ${order.status}, Payment: ${order.payment_status}`);
      // Extract admin email from notes if possible
      const adminMatch = order.notes.match(/Payment approved by admin: ([^\s|]+)/);
      if (adminMatch) {
        console.log(`     Admin: ${adminMatch[1]}`);
      }
    });
    
    // Get default admin user ID (since we can't always determine the exact admin from notes)
    const [adminUser] = await connection.execute(`
      SELECT user_id FROM users WHERE email = 'krutadodoli@gmail.com' LIMIT 1
    `);
    
    if (adminUser.length === 0) {
      console.log('❌ Could not find default admin user to set as confirmed_by');
      return;
    }
    
    const adminUserId = adminUser[0].user_id;
    
    console.log(`\n🔧 Fixing orders using admin user ID: ${adminUserId}...\n`);
    
    // Fix all orders
    for (const order of ordersToFix) {
      await connection.execute(`
        UPDATE orders 
        SET confirmed_by = ?,
            confirmed_at = created_at,
            payment_status = 'verified'
        WHERE id = ?
      `, [adminUserId, order.id]);
      
      console.log(`✅ Fixed order ${order.order_number}`);
    }
    
    console.log(`\n🎉 Successfully fixed ${ordersToFix.length} orders!`);
    
    // Verify the fix
    const [verifyQuery] = await connection.execute(`
      SELECT COUNT(*) as fixed_count
      FROM orders o
      WHERE o.status = 'confirmed'
      AND o.confirmed_by IS NOT NULL
      AND o.notes LIKE '%Payment approved by admin%'
    `);
    
    console.log(`✅ Verification: ${verifyQuery[0].fixed_count} orders now have proper confirmed_by field`);
    
    // Test the delivery query
    console.log(`\n🚚 Testing delivery query...\n`);
    
    const [deliveryTestQuery] = await connection.execute(`
      SELECT 
        o.id,
        o.order_number,
        o.status,
        o.confirmed_by,
        'Will now appear in delivery' as delivery_status
      FROM orders o
      WHERE o.status IN ('confirmed', 'processing', 'Order Received')
      AND (
        o.confirmed_by IS NOT NULL 
        OR o.status = 'Order Received'
        OR (o.notes LIKE '%Payment approved by admin%' AND o.status = 'confirmed')
      )
      AND NOT (o.order_number LIKE '%CUSTOM%' OR o.notes LIKE '%Custom Order%')
      ORDER BY o.order_date DESC
      LIMIT 10
    `);
    
    console.log(`📦 Delivery query results (showing ${deliveryTestQuery.length} orders):`);
    deliveryTestQuery.forEach(order => {
      console.log(`   ✅ ${order.order_number}: ${order.status} (confirmed_by: ${order.confirmed_by || 'null'})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (connection) await connection.end();
  }
}

fixAllAdminApprovedOrders();
