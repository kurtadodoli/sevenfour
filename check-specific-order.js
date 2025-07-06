const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing'
};

async function checkSpecificOrder() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database successfully');

    // Show all tables
    console.log('\n=== ALL TABLES ===');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('Tables in database:');
    tables.forEach(table => {
      console.log(`  ${Object.values(table)[0]}`);
    });

    const orderId = 'CUSTOM-MCNQQ7NW-GQEOI';
    
    // 1. Check custom order details using correct column name
    console.log('\n=== CUSTOM ORDER DETAILS ===');
    const [customOrders] = await connection.execute(
      'SELECT * FROM custom_orders WHERE custom_order_id = ?',
      [orderId]
    );
    console.log('Custom Order:', JSON.stringify(customOrders[0], null, 2));

    // 2. Check if there's a delivery_management table
    console.log('\n=== CHECKING DELIVERY_MANAGEMENT TABLE ===');
    try {
      const [deliveryRows] = await connection.execute(
        'SELECT * FROM delivery_management WHERE custom_order_id = ?',
        [orderId]
      );
      console.log('Delivery Management Records:', JSON.stringify(deliveryRows, null, 2));
    } catch (error) {
      console.log('delivery_management table does not exist or error:', error.message);
    }

    // 3. Check payment_verifications table if it exists
    console.log('\n=== CHECKING PAYMENT VERIFICATIONS ===');
    try {
      const [payments] = await connection.execute(
        'SELECT * FROM payment_verifications WHERE custom_order_id = ?',
        [orderId]
      );
      console.log('Payment Records:', JSON.stringify(payments, null, 2));
    } catch (error) {
      console.log('payment_verifications table does not exist or error:', error.message);
    }

    // 4. Look for any other tables that might contain delivery or order information
    console.log('\n=== SEARCHING FOR ORDER IN ALL RELEVANT TABLES ===');
    
    // Check orders table
    try {
      const [orders] = await connection.execute(
        'SELECT * FROM orders WHERE custom_order_id = ? OR reference_id = ?',
        [orderId, orderId]
      );
      console.log('Orders table records:', JSON.stringify(orders, null, 2));
    } catch (error) {
      console.log('orders table check failed:', error.message);
    }

    // Check for any table with "delivery" in the name
    const deliveryTables = tables.filter(table => 
      Object.values(table)[0].toLowerCase().includes('delivery')
    );
    console.log('Delivery-related tables:', deliveryTables.map(t => Object.values(t)[0]));

    if (customOrders[0]) {
      console.log('\n=== PRICE ANALYSIS ===');
      console.log('Estimated Price:', customOrders[0].estimated_price);
      console.log('Final Price:', customOrders[0].final_price);
      console.log('Payment Status:', customOrders[0].payment_status);
      console.log('Status:', customOrders[0].status);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkSpecificOrder();
