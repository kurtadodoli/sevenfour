const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing'
};

async function findOrderMapping() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    console.log('\n🔍 Looking for order CUSTOM-8H-QMZ5R-2498...');
    
    // Check in orders table (confirmed it's there with ID 47)
    const [ordersResult] = await connection.execute(`
      SELECT id, order_number, user_id, status, notes 
      FROM orders 
      WHERE order_number = 'CUSTOM-8H-QMZ5R-2498'
    `);
    
    if (ordersResult.length > 0) {
      console.log('📋 Found in orders table:');
      const order = ordersResult[0];
      console.log(`  ID: ${order.id}, Order: ${order.order_number}, User ID: ${order.user_id}, Status: ${order.status}`);
      console.log(`  Notes: ${order.notes}`);
      
      // Extract the reference from notes
      const referenceMatch = order.notes.match(/Reference: (CUSTOM-[A-Z0-9-]+)/);
      if (referenceMatch) {
        const reference = referenceMatch[1];
        console.log(`  Reference found: ${reference}`);
        
        // Look for this reference in custom_orders table
        console.log(`\n🔍 Looking for custom order with ID: ${reference}`);
        const [customOrdersResult] = await connection.execute(`
          SELECT id, custom_order_id, customer_name, status, delivery_status 
          FROM custom_orders 
          WHERE custom_order_id = ?
        `, [reference]);
        
        if (customOrdersResult.length > 0) {
          console.log('📋 Found matching custom order:');
          const customOrder = customOrdersResult[0];
          console.log(`  Custom Order ID: ${customOrder.id}, Custom Order Ref: ${customOrder.custom_order_id}`);
          console.log(`  Customer: ${customOrder.customer_name}, Status: ${customOrder.status}, Delivery Status: ${customOrder.delivery_status}`);
          
          console.log('\n✅ MAPPING FOUND:');
          console.log(`  Orders table ID: ${order.id} -> Custom Orders table ID: ${customOrder.id}`);
          console.log(`  Order Number: ${order.order_number} -> Custom Order Reference: ${customOrder.custom_order_id}`);
        } else {
          console.log('❌ No matching custom order found');
        }
      }
      
      // Also check by user_id
      console.log(`\n🔍 Looking for custom orders with user_id: ${order.user_id}`);
      const [userCustomOrders] = await connection.execute(`
        SELECT id, custom_order_id, customer_name, status, delivery_status 
        FROM custom_orders 
        WHERE user_id = ?
      `, [order.user_id]);
      
      if (userCustomOrders.length > 0) {
        console.log('📋 Custom orders for this user:');
        userCustomOrders.forEach(customOrder => {
          console.log(`  ID: ${customOrder.id}, Ref: ${customOrder.custom_order_id}, Customer: ${customOrder.customer_name}, Status: ${customOrder.status}, Delivery: ${customOrder.delivery_status}`);
        });
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

findOrderMapping();
