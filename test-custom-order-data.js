const db = require('./server/db');

async function testCustomOrderData() {
  try {
    console.log('=== Testing Custom Order Data Structure ===');
    
    // Check custom_orders table structure
    const customOrdersQuery = 'SELECT * FROM custom_orders LIMIT 1';
    const customOrderResult = await db.query(customOrdersQuery);
    console.log('Custom orders table columns:', Object.keys(customOrderResult.rows[0] || {}));
    
    // Check custom_order_payments table structure
    const paymentsQuery = 'SELECT * FROM custom_order_payments LIMIT 1';
    const paymentResult = await db.query(paymentsQuery);
    console.log('Custom order payments table columns:', Object.keys(paymentResult.rows[0] || {}));
    
    // Check if there are any custom orders with submitted payment proofs
    const ordersWithPayment = await db.query(`
      SELECT co.*, cop.payment_proof_filename, cop.payment_status, cop.gcash_reference_number
      FROM custom_orders co
      LEFT JOIN custom_order_payments cop ON co.custom_order_id = cop.custom_order_id
      WHERE cop.payment_proof_filename IS NOT NULL
      LIMIT 3
    `);
    
    console.log('\nCustom orders with payment proofs:');
    ordersWithPayment.rows.forEach((order, index) => {
      console.log(`Order ${index + 1}:`);
      console.log(`  ID: ${order.custom_order_id}`);
      console.log(`  Status: ${order.status}`);
      console.log(`  Payment Status: ${order.payment_status || 'None'}`);
      console.log(`  Payment Proof: ${order.payment_proof_filename || 'None'}`);
      console.log(`  Reference: ${order.gcash_reference_number || 'None'}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit(0);
  }
}

testCustomOrderData();
