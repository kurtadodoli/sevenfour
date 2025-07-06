const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function fixOrder() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    
    console.log('🔧 Fixing order ORD17517265241588952...');
    
    // Update the order to have proper confirmation status
    await connection.execute(`
      UPDATE orders 
      SET payment_status = 'verified', 
          confirmed_by = 967502321335218, 
          confirmed_at = NOW() 
      WHERE order_number = 'ORD17517265241588952'
    `);
    
    console.log('✅ Updated order payment status to verified and set confirmed_by');
    
    // Verify the update
    const [updated] = await connection.execute(`
      SELECT status, payment_status, confirmed_by, confirmed_at 
      FROM orders 
      WHERE order_number = 'ORD17517265241588952'
    `);
    
    console.log('Updated order:', updated[0]);
    
    // Test if it would now match the delivery query
    const [testQuery] = await connection.execute(`
      SELECT id, order_number, status, payment_status, confirmed_by
      FROM orders o
      WHERE o.order_number = 'ORD17517265241588952'
      AND o.status IN ('confirmed', 'processing', 'Order Received')
      AND (
        o.confirmed_by IS NOT NULL 
        OR o.status = 'Order Received'
      )
    `);
    
    if (testQuery.length > 0) {
      console.log('🎉 Order will now appear in delivery page!');
    } else {
      console.log('❌ Order still won\'t appear in delivery page');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (connection) await connection.end();
  }
}

fixOrder();
