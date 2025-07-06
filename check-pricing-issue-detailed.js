const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing'
};

async function checkPricingIssue() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database successfully');

    const orderId = 'CUSTOM-MCNQQ7NW-GQEOI';
    
    // 1. Check custom order details
    console.log('\n=== CUSTOM ORDER DETAILS ===');
    const [customOrders] = await connection.execute(
      'SELECT * FROM custom_orders WHERE order_id = ?',
      [orderId]
    );
    console.log('Custom Order:', JSON.stringify(customOrders[0], null, 2));

    // 2. Check delivery order details
    console.log('\n=== DELIVERY ORDER DETAILS ===');
    const [deliveryOrders] = await connection.execute(
      'SELECT * FROM delivery_orders WHERE custom_order_id = ?',
      [orderId]
    );
    console.log('Delivery Order:', JSON.stringify(deliveryOrders[0], null, 2));

    // 3. Check order items
    console.log('\n=== ORDER ITEMS ===');
    if (deliveryOrders[0]) {
      const [orderItems] = await connection.execute(
        'SELECT * FROM order_items WHERE delivery_order_id = ?',
        [deliveryOrders[0].id]
      );
      console.log('Order Items Count:', orderItems.length);
      console.log('Order Items:', JSON.stringify(orderItems, null, 2));
    }

    // 4. Check payment records
    console.log('\n=== PAYMENT RECORDS ===');
    const [payments] = await connection.execute(
      'SELECT * FROM payment_verifications WHERE custom_order_id = ?',
      [orderId]
    );
    console.log('Payment Records:', JSON.stringify(payments, null, 2));

    // 5. Check what the API endpoint returns
    console.log('\n=== API DATA COMPARISON ===');
    console.log('Expected Price from Custom Order:', customOrders[0]?.estimated_price);
    console.log('Actual Price from Delivery Order:', deliveryOrders[0]?.total_amount);
    console.log('Payment Amount:', payments[0]?.amount);

    // 6. Check if there are any calculation issues
    if (customOrders[0] && deliveryOrders[0]) {
      console.log('\n=== PRICE CALCULATION ANALYSIS ===');
      console.log('Custom Order Estimated Price:', customOrders[0].estimated_price);
      console.log('Custom Order Estimated Price Type:', typeof customOrders[0].estimated_price);
      console.log('Delivery Order Total Amount:', deliveryOrders[0].total_amount);
      console.log('Delivery Order Total Amount Type:', typeof deliveryOrders[0].total_amount);
      
      // Check if it's a string vs number issue
      console.log('Parsed Estimated Price:', parseFloat(customOrders[0].estimated_price));
      console.log('Parsed Total Amount:', parseFloat(deliveryOrders[0].total_amount));
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkPricingIssue();
