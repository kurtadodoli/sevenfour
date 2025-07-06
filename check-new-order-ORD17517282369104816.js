const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function checkNewOrder() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    
    console.log('🔍 Checking new order ORD17517282369104816...\n');
    
    // Check the order details
    const [order] = await connection.execute(`
      SELECT 
        id, order_number, status, payment_status, confirmed_by, 
        confirmed_at, notes, created_at, updated_at
      FROM orders 
      WHERE order_number = ?
    `, ['ORD17517282369104816']);
    
    if (order.length > 0) {
      console.log('📋 Order found in database:');
      const o = order[0];
      console.log(`   ID: ${o.id}`);
      console.log(`   Order Number: ${o.order_number}`);
      console.log(`   Status: ${o.status}`);
      console.log(`   Payment Status: ${o.payment_status}`);
      console.log(`   Confirmed By: ${o.confirmed_by}`);
      console.log(`   Confirmed At: ${o.confirmed_at}`);
      console.log(`   Created At: ${o.created_at}`);
      console.log(`   Updated At: ${o.updated_at}`);
      console.log(`   Notes: ${o.notes}`);
      
      // Check if it would match the delivery query
      const [deliveryTest] = await connection.execute(`
        SELECT 'Will appear in delivery' as result
        FROM orders o
        WHERE o.order_number = ?
        AND o.status IN ('confirmed', 'processing', 'Order Received')
        AND (
          o.confirmed_by IS NOT NULL 
          OR o.status = 'Order Received'
          OR (o.notes LIKE '%Payment approved by admin%' AND o.status = 'confirmed')
        )
      `, ['ORD17517282369104816']);
      
      console.log(`\n🚚 Delivery query test: ${deliveryTest.length > 0 ? '✅ WILL APPEAR' : '❌ WILL NOT APPEAR'}`);
      
      if (deliveryTest.length === 0) {
        console.log('\n🔧 Why it won\'t appear:');
        if (o.status !== 'confirmed' && o.status !== 'processing' && o.status !== 'Order Received') {
          console.log(`   - Status is "${o.status}" (needs to be confirmed/processing/Order Received)`);
        }
        if (o.confirmed_by === null && o.status !== 'Order Received' && !o.notes?.includes('Payment approved by admin')) {
          console.log(`   - confirmed_by is null AND status is not "Order Received" AND no admin approval in notes`);
        }
      }
      
    } else {
      console.log('❌ Order ORD17517282369104816 not found in database');
    }
    
    // Check if there are any recent orders with similar issues
    console.log('\n📊 Recent orders analysis:');
    const [recentOrders] = await connection.execute(`
      SELECT 
        order_number, status, payment_status, confirmed_by,
        CASE 
          WHEN confirmed_by IS NOT NULL THEN 'Will appear'
          WHEN status = 'Order Received' THEN 'Will appear' 
          WHEN notes LIKE '%Payment approved by admin%' AND status = 'confirmed' THEN 'Will appear'
          ELSE 'Will NOT appear'
        END as delivery_status
      FROM orders 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 2 DAY)
      ORDER BY created_at DESC
      LIMIT 10
    `);
    
    recentOrders.forEach(order => {
      console.log(`   ${order.order_number}: ${order.status} | ${order.delivery_status}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (connection) await connection.end();
  }
}

checkNewOrder();
