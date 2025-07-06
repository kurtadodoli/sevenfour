const mysql = require('mysql2/promise');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, 'server', '.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'seven_four_clothing'
};

async function checkOrder43Status() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    
    console.log('🔍 Checking status for Order 43 (CUSTOM-MCNQFDBQ-YQPWJ)');
    console.log('='.repeat(60));
    
    // 1. Check custom_orders table
    console.log('\n📋 1. custom_orders table:');
    const [customOrders] = await connection.execute(`
      SELECT id, custom_order_id, delivery_status, status, updated_at
      FROM custom_orders 
      WHERE id = 43
    `);
    
    if (customOrders.length > 0) {
      const order = customOrders[0];
      console.log(`   ✅ Found order:`);
      console.log(`      ID: ${order.id}`);
      console.log(`      Order Number: ${order.custom_order_id}`);
      console.log(`      Order Status: ${order.status}`);
      console.log(`      Delivery Status: ${order.delivery_status}`);
      console.log(`      Updated: ${order.updated_at}`);
    } else {
      console.log('   ❌ Order 43 not found');
    }
    
    // 2. Check delivery_schedules_enhanced table
    console.log('\n📋 2. delivery_schedules_enhanced table:');
    const [deliverySchedules] = await connection.execute(`
      SELECT id, order_id, order_number, order_type, delivery_status, delivery_date, updated_at, scheduled_at
      FROM delivery_schedules_enhanced 
      WHERE order_id = 43 AND order_type = 'custom_order'
      ORDER BY id DESC
    `);
    
    if (deliverySchedules.length > 0) {
      console.log(`   ✅ Found ${deliverySchedules.length} delivery schedule(s):`);
      deliverySchedules.forEach((schedule, index) => {
        console.log(`      ${index + 1}. Schedule ID: ${schedule.id}`);
        console.log(`         Order ID: ${schedule.order_id}`);
        console.log(`         Order Number: ${schedule.order_number}`);
        console.log(`         Delivery Status: ${schedule.delivery_status}`);
        console.log(`         Delivery Date: ${schedule.delivery_date}`);
        console.log(`         Scheduled At: ${schedule.scheduled_at}`);
        console.log(`         Updated: ${schedule.updated_at}`);
        console.log('');
      });
    } else {
      console.log('   ❌ No delivery schedules found');
    }
    
    console.log('🔧 DIAGNOSIS:');
    console.log('   The frontend logs show the status update API returned success.');
    console.log('   If the UI still shows "scheduled" instead of "delivered":');
    console.log('   1. Check if the update went to the right table');
    console.log('   2. Check if the frontend is reading from delivery_schedules_enhanced');
    console.log('   3. The delivery status might need to be updated in BOTH tables');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkOrder43Status();
