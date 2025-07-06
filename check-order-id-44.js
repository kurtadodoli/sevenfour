// Check what orders have ID 44
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing',
  port: 3306
};

async function checkOrderId44() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    
    console.log('🔍 Checking orders with ID 44...\n');
    
    // Check regular orders table
    console.log('📦 Checking orders table:');
    const [regularOrders] = await connection.execute(`
      SELECT id, order_number, status, delivery_status 
      FROM orders 
      WHERE id = 44
    `);
    
    if (regularOrders.length > 0) {
      regularOrders.forEach(order => {
        console.log(`   - Regular Order: ID=${order.id}, Number=${order.order_number}, Status=${order.status}, DeliveryStatus=${order.delivery_status}`);
      });
    } else {
      console.log('   - No regular orders with ID 44');
    }
    
    // Check custom_orders table
    console.log('\n🎨 Checking custom_orders table:');
    const [customOrders] = await connection.execute(`
      SELECT id, custom_order_id, status, delivery_status 
      FROM custom_orders 
      WHERE id = 44
    `);
    
    if (customOrders.length > 0) {
      customOrders.forEach(order => {
        console.log(`   - Custom Order: ID=${order.id}, Number=${order.custom_order_id}, Status=${order.status}, DeliveryStatus=${order.delivery_status}`);
      });
    } else {
      console.log('   - No custom orders with ID 44');
    }
    
    // Find the CUSTOM-MCNQQ7NW-GQEOI order
    console.log('\n🎯 Finding CUSTOM-MCNQQ7NW-GQEOI:');
    const [targetOrder] = await connection.execute(`
      SELECT id, custom_order_id, status, delivery_status 
      FROM custom_orders 
      WHERE custom_order_id = 'CUSTOM-MCNQQ7NW-GQEOI'
    `);
    
    if (targetOrder.length > 0) {
      targetOrder.forEach(order => {
        console.log(`   - Found: ID=${order.id}, Number=${order.custom_order_id}, Status=${order.status}, DeliveryStatus=${order.delivery_status}`);
      });
    } else {
      console.log('   - CUSTOM-MCNQQ7NW-GQEOI not found in custom_orders table');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

checkOrderId44();
