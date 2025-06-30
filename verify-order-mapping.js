const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing'
};

async function verifyOrderMapping() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    console.log('\n🔍 Looking for order CUSTOM-8H-QMZ5R-2498...');
    
    // Check in orders table
    const [ordersResult] = await connection.execute(`
      SELECT id, order_number, customer_name, status, created_at 
      FROM orders 
      WHERE order_number = 'CUSTOM-8H-QMZ5R-2498'
    `);
    
    if (ordersResult.length > 0) {
      console.log('📋 Found in orders table:');
      ordersResult.forEach(order => {
        console.log(`  ID: ${order.id}, Order: ${order.order_number}, Customer: ${order.customer_name}, Status: ${order.status}`);
      });
    } else {
      console.log('❌ Not found in orders table');
    }

    // Check in custom_orders table
    const [customOrdersResult] = await connection.execute(`
      SELECT id, order_number, customer_name, status, delivery_status, created_at 
      FROM custom_orders 
      WHERE order_number = 'CUSTOM-8H-QMZ5R-2498'
    `);
    
    if (customOrdersResult.length > 0) {
      console.log('📋 Found in custom_orders table:');
      customOrdersResult.forEach(order => {
        console.log(`  ID: ${order.id}, Order: ${order.order_number}, Customer: ${order.customer_name}, Status: ${order.status}, Delivery Status: ${order.delivery_status}`);
      });
    } else {
      console.log('❌ Not found in custom_orders table');
    }

    // Check if there are any custom orders for the same customer
    if (ordersResult.length > 0) {
      const customerName = ordersResult[0].customer_name;
      console.log(`\n🔍 Looking for custom orders for customer: ${customerName}`);
      
      const [customerCustomOrders] = await connection.execute(`
        SELECT id, order_number, customer_name, status, delivery_status 
        FROM custom_orders 
        WHERE customer_name = ?
      `, [customerName]);
      
      if (customerCustomOrders.length > 0) {
        console.log('📋 Custom orders for this customer:');
        customerCustomOrders.forEach(order => {
          console.log(`  ID: ${order.id}, Order: ${order.order_number}, Status: ${order.status}, Delivery Status: ${order.delivery_status}`);
        });
      } else {
        console.log('❌ No custom orders found for this customer');
      }
    }

  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

verifyOrderMapping();
