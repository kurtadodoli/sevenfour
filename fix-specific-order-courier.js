const mysql = require('mysql2/promise');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, 'server', '.env') });

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'seven_four_clothing'
};

async function checkSpecificOrder() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    
    console.log('🔍 Checking specific order from screenshot: CUSTOM-MCNOZFFQ-X8B36\n');
    
    // 1. Check if this order exists in custom_orders
    console.log('1. CUSTOM ORDER DETAILS:');
    const [customOrder] = await connection.execute(`
      SELECT * FROM custom_orders 
      WHERE custom_order_id = 'CUSTOM-MCNOZFFQ-X8B36'
    `);
    
    if (customOrder.length === 0) {
      console.log('   Order not found in custom_orders table');
    } else {
      const order = customOrder[0];
      console.log(`   ID: ${order.id}, Order#: ${order.custom_order_id}`);
      console.log(`   Customer: ${order.customer_name}, Email: ${order.customer_email}`);
      console.log(`   Status: ${order.status}, Payment: ${order.payment_status}`);
      console.log(`   Payment Verified: ${order.payment_verified_at}`);
      console.log(`   Delivery Status: ${order.delivery_status}`);
      console.log('');
    }
    
    // 2. Check delivery schedule for this order
    console.log('2. DELIVERY SCHEDULE:');
    const [deliverySchedule] = await connection.execute(`
      SELECT 
        ds.*,
        c.name as courier_name,
        c.phone_number as courier_phone
      FROM delivery_schedules_enhanced ds
      LEFT JOIN couriers c ON ds.courier_id = c.id
      WHERE ds.order_number = 'CUSTOM-MCNOZFFQ-X8B36'
      ORDER BY ds.created_at DESC
    `);
    
    if (deliverySchedule.length === 0) {
      console.log('   No delivery schedule found for this order');
    } else {
      deliverySchedule.forEach(schedule => {
        console.log(`   Schedule ID: ${schedule.id}`);
        console.log(`   Order Number: ${schedule.order_number}, Type: ${schedule.order_type}`);
        console.log(`   Delivery Date: ${schedule.delivery_date}, Time: ${schedule.delivery_time_slot}`);
        console.log(`   Delivery Status: ${schedule.delivery_status}`);
        console.log(`   Courier ID: ${schedule.courier_id}, Name: ${schedule.courier_name || 'NULL'}, Phone: ${schedule.courier_phone || 'NULL'}`);
        console.log(`   Created: ${schedule.created_at}, Updated: ${schedule.updated_at}`);
        console.log('');
      });
    }
    
    // 3. Manual assignment of Kenneth Marzan to this order (if it exists)
    if (deliverySchedule.length > 0) {
      console.log('3. ATTEMPTING TO ASSIGN KENNETH MARZAN TO THIS ORDER:');
      const kennethId = 10; // From previous query we know Kenneth's ID is 10
      const scheduleId = deliverySchedule[0].id;
      
      console.log(`   Updating delivery schedule ${scheduleId} to assign courier ${kennethId}...`);
      
      const [updateResult] = await connection.execute(`
        UPDATE delivery_schedules_enhanced 
        SET courier_id = ? 
        WHERE id = ?
      `, [kennethId, scheduleId]);
      
      console.log(`   Update result: ${updateResult.affectedRows} row(s) affected`);
      
      // Verify the update
      const [verifyUpdate] = await connection.execute(`
        SELECT 
          ds.*,
          c.name as courier_name,
          c.phone_number as courier_phone
        FROM delivery_schedules_enhanced ds
        LEFT JOIN couriers c ON ds.courier_id = c.id
        WHERE ds.id = ?
      `, [scheduleId]);
      
      if (verifyUpdate.length > 0) {
        const updated = verifyUpdate[0];
        console.log(`   ✅ VERIFICATION - Courier ID: ${updated.courier_id}, Name: ${updated.courier_name}, Phone: ${updated.courier_phone}`);
      }
    } else {
      console.log('3. Cannot assign courier - no delivery schedule exists for this order');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkSpecificOrder();
