const mysql = require('mysql2/promise');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, 'server', '.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'seven_four_clothing'
};

async function findCustomOrderByNumber() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    
    console.log('Looking for custom order: CUSTOM-MCNQFDBQ-YQPWJ');
    
    // Search by custom_order_id instead of order_number
    const [ordersByNumber] = await connection.execute(`
      SELECT id, custom_order_id, customer_name, customer_email, customer_phone, 
             CONCAT(street_number, ', ', barangay, ', ', municipality, ', ', province) as full_address
      FROM custom_orders 
      WHERE custom_order_id = ?
    `, ['CUSTOM-MCNQFDBQ-YQPWJ']);
    
    if (ordersByNumber.length > 0) {
      console.log('✅ Found by custom_order_id:');
      ordersByNumber.forEach(order => {
        console.log(`  ID: ${order.id}, Order: ${order.custom_order_id}, Customer: ${order.customer_name}`);
        console.log(`  Email: ${order.customer_email}, Phone: ${order.customer_phone}`);
        console.log(`  Address: ${order.full_address || 'No address'}`);
      });
    } else {
      console.log('❌ Not found by exact custom_order_id, searching for similar...');
      
      const [ordersLike] = await connection.execute(`
        SELECT id, custom_order_id, customer_name, customer_email, customer_phone
        FROM custom_orders 
        WHERE custom_order_id LIKE ?
      `, ['%MCNQFDBQ%']);
      
      if (ordersLike.length > 0) {
        console.log('✅ Found similar orders:');
        ordersLike.forEach(order => {
          console.log(`  ID: ${order.id}, Order: ${order.custom_order_id}, Customer: ${order.customer_name}`);
        });
      } else {
        console.log('❌ No orders found with MCNQFDBQ. Showing recent custom orders:');
        
        const [recentOrders] = await connection.execute(`
          SELECT id, custom_order_id, customer_name, status, created_at
          FROM custom_orders 
          ORDER BY created_at DESC 
          LIMIT 10
        `);
        
        console.log('Recent orders:');
        recentOrders.forEach(order => {
          console.log(`  ID: ${order.id}, Order: ${order.custom_order_id}, Customer: ${order.customer_name}, Status: ${order.status}`);
        });
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

findCustomOrderByNumber();
