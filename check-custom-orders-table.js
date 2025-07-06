// Check the actual delivery_status in the custom_orders table
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing',
  port: 3306
};

async function checkCustomOrdersTable() {
  let connection;
  
  try {
    console.log('🔍 Checking custom_orders table directly...');
    connection = await mysql.createConnection(dbConfig);
    
    // Check the specific order
    const [orders] = await connection.execute(`
      SELECT 
        id,
        custom_order_id,
        customer_name,
        customer_email,
        status,
        delivery_status,
        payment_status,
        updated_at,
        created_at
      FROM custom_orders 
      WHERE custom_order_id = 'CUSTOM-MCNQQ7NW-GQEOI'
    `);
    
    if (orders.length > 0) {
      const order = orders[0];
      console.log('\n📋 Custom Order from Database:');
      console.log(`   ID: ${order.id}`);
      console.log(`   Order Number: ${order.custom_order_id}`);
      console.log(`   Customer: ${order.customer_name}`);
      console.log(`   Customer Email: ${order.customer_email}`);
      console.log(`   Order Status: ${order.status}`);
      console.log(`   Delivery Status: ${order.delivery_status}`);
      console.log(`   Payment Status: ${order.payment_status}`);
      console.log(`   Updated At: ${order.updated_at}`);
      console.log(`   Created At: ${order.created_at}`);
      
      if (order.delivery_status === 'delivered') {
        console.log('\n✅ SUCCESS: delivery_status is correctly "delivered" in the database');
        console.log('💡 The issue must be with the /custom-orders/my-orders API not returning this field properly');
      } else {
        console.log(`\n❌ ISSUE: delivery_status is "${order.delivery_status}" in the database`);
        console.log('💡 The delivery status update may not have worked correctly');
      }
      
      // Let's also check if there's a user_id or customer_email issue
      console.log('\n🔍 User Association:');
      console.log(`   Customer Email: ${order.customer_email}`);
      console.log('   (The /custom-orders/my-orders API filters by customer_email from JWT)');
      
    } else {
      console.log('❌ Order CUSTOM-MCNQQ7NW-GQEOI not found in custom_orders table');
    }
    
    // Also check if there are multiple records
    const [allOrders] = await connection.execute(`
      SELECT id, custom_order_id, delivery_status 
      FROM custom_orders 
      WHERE custom_order_id LIKE '%MCNQQ7NW%'
    `);
    
    console.log(`\n📊 Similar order IDs found: ${allOrders.length}`);
    allOrders.forEach(order => {
      console.log(`   ID: ${order.id}, Order: ${order.custom_order_id}, Delivery Status: ${order.delivery_status}`);
    });
    
  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    if (connection) await connection.end();
  }
}

checkCustomOrdersTable();
