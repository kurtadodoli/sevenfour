const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing'
};

async function checkPaymentFlow() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database successfully');

    const orderId = 'CUSTOM-MCNQQ7NW-GQEOI';
    
    // Find payment verification for this order
    console.log('\n=== PAYMENT VERIFICATION RECORDS ===');
    const [payments] = await connection.execute(
      'SELECT * FROM payment_verifications WHERE payment_reference = ?',
      [orderId]
    );
    console.log('Payment records:', JSON.stringify(payments, null, 2));

    // Check for user-related payments
    console.log('\n=== PAYMENT BY USER ID ===');
    const [userPayments] = await connection.execute(
      'SELECT * FROM payment_verifications WHERE user_id = ?',
      ['967502321335218'] // user_id from custom order
    );
    console.log('User payment records:', JSON.stringify(userPayments, null, 2));

    // Check order items table if it exists
    console.log('\n=== CHECKING ORDER_ITEMS TABLE ===');
    try {
      const [orderItemsCols] = await connection.execute('DESCRIBE order_items');
      console.log('Order Items Columns:', orderItemsCols.map(col => col.Field).join(', '));
      
      // Look for order items related to this order
      const [orderItems] = await connection.execute(
        'SELECT * FROM order_items WHERE product_name LIKE ? OR order_reference LIKE ?',
        ['%Custom Jerseys%', `%${orderId}%`]
      );
      console.log('Related order items:', JSON.stringify(orderItems, null, 2));
    } catch (error) {
      console.log('Order items check error:', error.message);
    }

    // Check orders table
    console.log('\n=== CHECKING ORDERS TABLE ===');
    try {
      const [ordersCols] = await connection.execute('DESCRIBE orders');
      console.log('Orders Columns:', ordersCols.map(col => col.Field).join(', '));
      
      // Look for related orders
      const [orders] = await connection.execute(
        'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 5',
        ['967502321335218']
      );
      console.log('User orders:', JSON.stringify(orders, null, 2));
    } catch (error) {
      console.log('Orders table check error:', error.message);
    }

    // Check the specific problem: Why final_price is 0
    console.log('\n=== FINAL PRICE ANALYSIS ===');
    const [customOrder] = await connection.execute(
      'SELECT estimated_price, final_price, payment_status, status, payment_verified_at FROM custom_orders WHERE custom_order_id = ?',
      [orderId]
    );
    
    if (customOrder[0]) {
      const order = customOrder[0];
      console.log('Price Analysis:');
      console.log(`  Estimated Price: ${order.estimated_price}`);
      console.log(`  Final Price: ${order.final_price}`);
      console.log(`  Payment Status: ${order.payment_status}`);
      console.log(`  Order Status: ${order.status}`);
      console.log(`  Payment Verified At: ${order.payment_verified_at}`);
      
      console.log('\nPROBLEM IDENTIFIED:');
      console.log('The final_price should be set to estimated_price when payment is verified, but it remains 0.00');
      console.log('This suggests the backend payment verification logic is not updating the final_price properly.');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkPaymentFlow();
