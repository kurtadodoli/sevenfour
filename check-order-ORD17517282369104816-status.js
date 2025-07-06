const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function checkOrderStatus() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);

    console.log('=== CHECKING ORDER ORD17517282369104816 STATUS ===\n');

    // Check order details
    const [orderRows] = await connection.execute(`
      SELECT 
        id,
        order_number,
        status,
        payment_status,
        confirmed_by,
        confirmed_at,
        created_at,
        updated_at,
        notes
      FROM orders 
      WHERE order_number = ?
    `, ['ORD17517282369104816']);

    if (orderRows.length === 0) {
      console.log('❌ Order not found in database');
      return;
    }

    const order = orderRows[0];
    console.log('📋 ORDER DETAILS:');
    console.log(`Order Number: ${order.order_number}`);
    console.log(`Status: ${order.status}`);
    console.log(`Payment Status: ${order.payment_status}`);
    console.log(`Confirmed By: ${order.confirmed_by}`);
    console.log(`Confirmed At: ${order.confirmed_at}`);
    console.log(`Created At: ${order.created_at}`);
    console.log(`Updated At: ${order.updated_at}`);
    console.log(`Notes: ${order.notes}`);

    console.log('\n=== DELIVERY QUERY TEST ===');
    
    // Test the delivery query
    const [deliveryRows] = await connection.execute(`
      SELECT 
        o.id,
        o.order_number,
        o.status,
        o.confirmed_by,
        o.payment_status,
        CASE 
          WHEN o.confirmed_by IS NOT NULL THEN 'Has confirmed_by'
          WHEN o.status = 'Order Received' THEN 'Order Received status'
          WHEN (o.notes LIKE '%Payment approved by admin%' AND o.status = 'confirmed') THEN 'Admin approval fallback'
          ELSE 'NO MATCH'
        END AS match_reason
      FROM orders o
      WHERE o.order_number = ?
      AND o.status IN ('confirmed', 'processing', 'Order Received')
      AND (
        o.confirmed_by IS NOT NULL 
        OR o.status = 'Order Received'
        OR (o.notes LIKE '%Payment approved by admin%' AND o.status = 'confirmed')
      )
    `, ['ORD17517282369104816']);

    if (deliveryRows.length > 0) {
      console.log('✅ Order WOULD appear in delivery query');
      console.log(`Match reason: ${deliveryRows[0].match_reason}`);
    } else {
      console.log('❌ Order would NOT appear in delivery query');
      console.log('Checking why...');
      
      // Check each condition
      console.log('\nCondition Analysis:');
      console.log(`- Status in allowed: ${['confirmed', 'processing', 'Order Received'].includes(order.status)}`);
      console.log(`- Has confirmed_by: ${order.confirmed_by !== null}`);
      console.log(`- Is Order Received: ${order.status === 'Order Received'}`);
      console.log(`- Has admin approval in notes: ${order.notes && order.notes.includes('Payment approved by admin')}`);
      console.log(`- Status is confirmed: ${order.status === 'confirmed'}`);
    }

    console.log('\n=== TRANSACTION PAGE QUERY TEST ===');
    
    // Test transaction page query
    const [transactionRows] = await connection.execute(`
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

    if (transactionRows.length > 0) {
      console.log('✅ Order WOULD appear in transaction page');
    } else {
      console.log('❌ Order would NOT appear in transaction page');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkOrderStatus();
