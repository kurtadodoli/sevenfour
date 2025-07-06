const mysql = require('mysql2/promise');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, 'server', '.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'seven_four_clothing'
};

async function checkOrder() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    
    console.log('Checking order ID 43:');
    
    // Check in custom_orders table
    const [customOrders] = await connection.execute('SELECT * FROM custom_orders WHERE id = ?', [43]);
    console.log('In custom_orders table:', customOrders.length > 0 ? 'FOUND' : 'NOT FOUND');
    if (customOrders.length > 0) {
      console.log('Custom order:', customOrders[0].order_number, customOrders[0].customer_name);
    }
    
    // Check in orders table for delivery orders
    const [orders] = await connection.execute('SELECT * FROM orders WHERE id = ? AND notes LIKE ?', [43, '%Reference: CUSTOM-%']);
    console.log('In orders table (delivery orders):', orders.length > 0 ? 'FOUND' : 'NOT FOUND');
    if (orders.length > 0) {
      console.log('Delivery order:', orders[0].order_number);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkOrder();
