const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 's3v3n-f0ur-cl0thing*', 
  database: 'seven_four_clothing'
};

async function checkCurrentStatus() {
  const connection = await mysql.createConnection(dbConfig);
  
  // Check both orders and custom_orders tables
  console.log('=== ORDERS TABLE ===');
  const [orders] = await connection.execute('SELECT id, order_number, status, notes FROM orders WHERE order_number = "CUSTOM-8H-QMZ5R-2498"');
  console.log(orders[0]);
  
  console.log('\n=== CUSTOM_ORDERS TABLE ===');  
  const [customOrders] = await connection.execute('SELECT id, custom_order_id, status, delivery_status FROM custom_orders WHERE custom_order_id = "CUSTOM-MCED998H-QMZ5R"');
  console.log(customOrders[0]);
  
  await connection.end();
}

checkCurrentStatus();
