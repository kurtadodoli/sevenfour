const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing',
};

async function checkOrdersForTesting() {
  let connection;
  try {
    console.log('Checking orders for testing regular order scheduling...\n');
    connection = await mysql.createConnection(dbConfig);
    
    // Check for orders with delivery_status = 'scheduled'
    console.log('=== SCHEDULED ORDERS ===');
    const [scheduledOrders] = await connection.execute(`
      SELECT id, order_number, status, delivery_status, scheduled_delivery_date, delivery_notes
      FROM orders 
      WHERE delivery_status = 'scheduled'
      ORDER BY id
    `);
    
    if (scheduledOrders.length > 0) {
      scheduledOrders.forEach(order => {
        console.log(`Order ${order.id}: ${order.order_number}`);
        console.log(`  Status: ${order.status}`);
        console.log(`  Delivery Status: ${order.delivery_status}`);
        console.log(`  Scheduled Date: ${order.scheduled_delivery_date}`);
        console.log(`  Notes: ${order.delivery_notes || 'none'}`);
        console.log('');
      });
    } else {
      console.log('No scheduled orders found');
    }
    
    // Check for confirmed orders without delivery status (good for testing)
    console.log('=== CONFIRMED ORDERS (Available for scheduling) ===');
    const [confirmedOrders] = await connection.execute(`
      SELECT id, order_number, status, delivery_status, scheduled_delivery_date
      FROM orders 
      WHERE status = 'confirmed' AND (delivery_status IS NULL OR delivery_status = '')
      ORDER BY id DESC
      LIMIT 5
    `);
    
    if (confirmedOrders.length > 0) {
      confirmedOrders.forEach(order => {
        console.log(`Order ${order.id}: ${order.order_number} - Status: ${order.status}, Delivery: ${order.delivery_status || 'none'}`);
      });
    } else {
      console.log('No unscheduled confirmed orders found');
    }
    
    // Check for orders with different statuses for testing button functionality
    console.log('\n=== ORDERS WITH VARIOUS DELIVERY STATUSES ===');
    const [statusOrders] = await connection.execute(`
      SELECT id, order_number, status, delivery_status, scheduled_delivery_date
      FROM orders 
      WHERE delivery_status IS NOT NULL AND delivery_status != ''
      ORDER BY delivery_status, id
    `);
    
    if (statusOrders.length > 0) {
      statusOrders.forEach(order => {
        console.log(`Order ${order.id}: ${order.order_number} - Status: ${order.status}, Delivery: ${order.delivery_status}, Date: ${order.scheduled_delivery_date || 'none'}`);
      });
    } else {
      console.log('No orders with delivery status found');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkOrdersForTesting();
