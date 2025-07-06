// Check what order ID 43 refers to in different tables
require('dotenv').config({ path: './server/.env' });

async function checkOrderId43() {
  console.log('🔍 Investigating Order ID 43 in all tables');
  console.log('=============================================');
  
  const mysql = require('mysql2/promise');
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'seven_four_clothing',
    port: process.env.DB_PORT || 3306
  });
  
  try {
    // Check orders table
    const [regularOrders] = await connection.execute(`
      SELECT id, order_number, status, delivery_status, created_at 
      FROM orders 
      WHERE id = 43
    `);
    
    console.log('📦 Regular orders table (id = 43):');
    if (regularOrders.length > 0) {
      console.log('   ✅ Found:', regularOrders[0]);
    } else {
      console.log('   ❌ No order found');
    }
    
    // Check custom_orders table
    const [customOrders] = await connection.execute(`
      SELECT id, custom_order_id, status, delivery_status, created_at 
      FROM custom_orders 
      WHERE id = 43
    `);
    
    console.log('\n🎨 Custom orders table (id = 43):');
    if (customOrders.length > 0) {
      console.log('   ✅ Found:', customOrders[0]);
    } else {
      console.log('   ❌ No order found');
    }
    
    // Check custom_designs table
    const [customDesigns] = await connection.execute(`
      SELECT id, design_id, status, delivery_status, created_at 
      FROM custom_designs 
      WHERE id = 43
    `);
    
    console.log('\n🎨 Custom designs table (id = 43):');
    if (customDesigns.length > 0) {
      console.log('   ✅ Found:', customDesigns[0]);
    } else {
      console.log('   ❌ No order found');
    }
    
    // Check delivery schedules
    const [deliverySchedules] = await connection.execute(`
      SELECT id, order_id, order_number, order_type, delivery_status, created_at 
      FROM delivery_schedules_enhanced 
      WHERE order_id = 43
    `);
    
    console.log('\n🚚 Delivery schedules for order_id = 43:');
    if (deliverySchedules.length > 0) {
      deliverySchedules.forEach((schedule, index) => {
        console.log(`   ${index + 1}. Schedule ID: ${schedule.id}, Type: ${schedule.order_type}, Number: ${schedule.order_number}, Status: ${schedule.delivery_status}`);
      });
    } else {
      console.log('   ❌ No delivery schedules found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await connection.end();
  }
}

checkOrderId43();
