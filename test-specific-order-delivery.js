const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function testSpecificOrder() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    
    console.log('🚚 Testing delivery query for ORD17517265241588952...\n');
    
    const [result] = await connection.execute(`
      SELECT 
        o.id,
        o.order_number,
        o.status,
        o.payment_status,
        o.confirmed_by,
        'WILL APPEAR IN DELIVERY' as will_appear
      FROM orders o
      WHERE o.order_number = ?
      AND o.status IN ('confirmed', 'processing', 'Order Received')
      AND (
        o.confirmed_by IS NOT NULL 
        OR o.status = 'Order Received'
        OR (o.notes LIKE '%Payment approved by admin%' AND o.status = 'confirmed')
      )
    `, ['ORD17517265241588952']);
    
    if (result.length > 0) {
      console.log('✅ SUCCESS: Order will appear in delivery page!');
      console.log('Order details:', result[0]);
    } else {
      console.log('❌ Order will NOT appear in delivery page');
      
      // Debug - show the current order status
      const [currentStatus] = await connection.execute(`
        SELECT order_number, status, payment_status, confirmed_by, notes
        FROM orders 
        WHERE order_number = ?
      `, ['ORD17517265241588952']);
      
      if (currentStatus.length > 0) {
        console.log('\nCurrent order status:', currentStatus[0]);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (connection) await connection.end();
  }
}

testSpecificOrder();
