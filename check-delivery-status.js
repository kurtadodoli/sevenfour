const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing',
};

async function checkDeliveryStatus() {
  let connection;
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    
    // Check for deliveries in the calendar table
    console.log('\nChecking calendar table for deliveries:');
    const [calendarRows] = await connection.execute(`
      SELECT id, date, customer_id, order_id, status, type, created_at 
      FROM calendar 
      WHERE type = 'delivery' 
      ORDER BY date DESC 
      LIMIT 10
    `);
    
    if (calendarRows.length > 0) {
      console.log('Calendar deliveries found:');
      calendarRows.forEach(row => {
        console.log(`- ID: ${row.id}, Date: ${row.date}, Order: ${row.order_id}, Status: ${row.status}`);
      });
    } else {
      console.log('No deliveries found in calendar table');
    }
    
    // Check for orders with delivery_status set
    console.log('\nChecking orders table for delivery_status:');
    const [orderRows] = await connection.execute(`
      SELECT id, order_number, delivery_status, status, created_at 
      FROM orders 
      WHERE delivery_status IS NOT NULL AND delivery_status != ''
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    
    if (orderRows.length > 0) {
      console.log('Orders with delivery_status found:');
      orderRows.forEach(row => {
        console.log(`- Order ${row.id}: ${row.order_number} - Status: ${row.status}, Delivery: ${row.delivery_status}`);
      });
    } else {
      console.log('No orders with delivery_status found');
    }
    
    // Check recent orders for testing
    console.log('\nRecent confirmed orders (for testing):');
    const [recentOrders] = await connection.execute(`
      SELECT id, order_number, status, delivery_status, created_at 
      FROM orders 
      WHERE status = 'confirmed' 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    recentOrders.forEach(row => {
      console.log(`- Order ${row.id}: ${row.order_number} - Status: ${row.status}, Delivery: ${row.delivery_status || 'none'}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkDeliveryStatus();
