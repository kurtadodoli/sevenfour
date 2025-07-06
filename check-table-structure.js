const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing'
};

async function checkTableStructure() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database successfully');

    // Check custom_orders table structure
    console.log('\n=== CUSTOM_ORDERS TABLE STRUCTURE ===');
    const [customOrdersCols] = await connection.execute('DESCRIBE custom_orders');
    console.log('Custom Orders Columns:');
    customOrdersCols.forEach(col => {
      console.log(`  ${col.Field} (${col.Type}) - ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} - ${col.Key} - Default: ${col.Default}`);
    });

    // Check delivery_orders table structure
    console.log('\n=== DELIVERY_ORDERS TABLE STRUCTURE ===');
    const [deliveryOrdersCols] = await connection.execute('DESCRIBE delivery_orders');
    console.log('Delivery Orders Columns:');
    deliveryOrdersCols.forEach(col => {
      console.log(`  ${col.Field} (${col.Type}) - ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} - ${col.Key} - Default: ${col.Default}`);
    });

    // Check payment_verifications table structure
    console.log('\n=== PAYMENT_VERIFICATIONS TABLE STRUCTURE ===');
    const [paymentCols] = await connection.execute('DESCRIBE payment_verifications');
    console.log('Payment Verifications Columns:');
    paymentCols.forEach(col => {
      console.log(`  ${col.Field} (${col.Type}) - ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} - ${col.Key} - Default: ${col.Default}`);
    });

    // Look for the specific order
    console.log('\n=== FINDING SPECIFIC ORDER ===');
    const [customOrders] = await connection.execute('SELECT * FROM custom_orders LIMIT 10');
    console.log('Sample custom orders (first 10):');
    customOrders.forEach(order => {
      console.log(`ID: ${order.id}, Custom Order ID: ${order.custom_order_id || 'N/A'}, Status: ${order.status || 'N/A'}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkTableStructure();
