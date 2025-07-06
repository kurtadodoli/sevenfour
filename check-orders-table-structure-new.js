const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function checkTableStructure() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);

    console.log('=== CHECKING ORDERS TABLE STRUCTURE ===\n');

    const [columns] = await connection.execute(`
      DESCRIBE orders
    `);

    console.log('Orders table columns:');
    columns.forEach(col => {
      console.log(`- ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Key ? col.Key : ''}`);
    });

    console.log('\n=== LOOKING FOR ORDERS WITH SIMILAR ID ===\n');

    // Try to find orders with similar pattern
    const [similarOrders] = await connection.execute(`
      SELECT id, order_number, status, payment_status, confirmed_by, confirmed_at, created_at, notes
      FROM orders 
      WHERE order_number LIKE '%17517282369104816%'
      LIMIT 5
    `);

    if (similarOrders.length > 0) {
      console.log('Found orders with similar ID:');
      similarOrders.forEach(order => {
        console.log(`- ID: ${order.id}, Order Number: ${order.order_number}, Status: ${order.status}, Payment: ${order.payment_status}, Confirmed By: ${order.confirmed_by}`);
      });
    } else {
      console.log('No orders found with that pattern');
      
      // Let's check recent orders
      const [recentOrders] = await connection.execute(`
        SELECT id, order_number, status, payment_status, confirmed_by, confirmed_at, created_at, notes
        FROM orders 
        ORDER BY created_at DESC
        LIMIT 10
      `);

      console.log('\n=== RECENT ORDERS ===');
      recentOrders.forEach(order => {
        console.log(`- ID: ${order.id}, Order Number: ${order.order_number}, Status: ${order.status}, Payment: ${order.payment_status}, Created: ${order.created_at}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkTableStructure();
