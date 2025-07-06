const mysql = require('mysql2/promise');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, 'server', '.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'seven_four_clothing'
};

async function testFixedQuery() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    
    console.log('🧪 Testing fixed custom order query for ID 43...');
    
    const order_id = 43;
    
    // Test the exact query that would be used in the fixed controller
    const [customOrders] = await connection.execute(`
      SELECT co.*, 
             co.customer_name,
             co.customer_email,
             co.customer_phone,
             CONCAT(
               COALESCE(co.house_number, ''), 
               CASE WHEN co.house_number IS NOT NULL THEN ' ' ELSE '' END,
               COALESCE(co.street_number, ''), 
               CASE WHEN co.barangay IS NOT NULL THEN CONCAT(', ', co.barangay) ELSE '' END,
               CASE WHEN co.municipality IS NOT NULL THEN CONCAT(', ', co.municipality) ELSE '' END,
               CASE WHEN co.province IS NOT NULL THEN CONCAT(', ', co.province) ELSE '' END,
               CASE WHEN co.postal_code IS NOT NULL THEN CONCAT(' ', co.postal_code) ELSE '' END
             ) as shipping_address,
             CONCAT(
               COALESCE(co.house_number, ''), 
               CASE WHEN co.house_number IS NOT NULL THEN ' ' ELSE '' END,
               COALESCE(co.street_number, ''), 
               CASE WHEN co.barangay IS NOT NULL THEN CONCAT(', ', co.barangay) ELSE '' END,
               CASE WHEN co.municipality IS NOT NULL THEN CONCAT(', ', co.municipality) ELSE '' END,
               CASE WHEN co.province IS NOT NULL THEN CONCAT(', ', co.province) ELSE '' END,
               CASE WHEN co.postal_code IS NOT NULL THEN CONCAT(' ', co.postal_code) ELSE '' END
             ) as delivery_address,
             co.customer_phone as contact_phone,
             co.custom_order_id as order_number
      FROM custom_orders co
      WHERE co.id = ?
    `, [order_id]);
    
    if (customOrders.length > 0) {
      console.log('✅ Query successful! Order details:');
      const order = customOrders[0];
      console.log(`  Order Number: ${order.order_number}`);
      console.log(`  Customer: ${order.customer_name}`);
      console.log(`  Email: ${order.customer_email}`);
      console.log(`  Phone: ${order.customer_phone}`);
      console.log(`  Shipping Address: ${order.shipping_address}`);
      console.log(`  Delivery Address: ${order.delivery_address}`);
      console.log(`  Status: ${order.status}`);
      console.log(`  Payment Status: ${order.payment_status}`);
      
      console.log('\n📋 This order should now be schedulable for delivery!');
    } else {
      console.log('❌ Query failed - no results');
    }
    
  } catch (error) {
    console.error('❌ Query error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testFixedQuery();
