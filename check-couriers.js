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

async function checkCouriers() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    
    console.log('🚚 Checking courier data...\n');
    
    // 1. Check all couriers in the system
    console.log('1. ALL COURIERS IN SYSTEM:');
    const [couriers] = await connection.execute(`
      SELECT * FROM couriers ORDER BY created_at DESC
    `);
    
    if (couriers.length === 0) {
      console.log('   No couriers found in the system!');
    } else {
      couriers.forEach(courier => {
        console.log(`   ID: ${courier.id}, Name: ${courier.name}, Phone: ${courier.phone_number}`);
        console.log(`   Vehicle: ${courier.vehicle_type}, Status: ${courier.status}`);
        console.log('');
      });
    }
    
    // 2. Check delivery schedules with non-null courier_id
    console.log('2. DELIVERY SCHEDULES WITH ASSIGNED COURIERS:');
    const [assignedDeliveries] = await connection.execute(`
      SELECT 
        ds.*,
        c.name as courier_name,
        c.phone_number as courier_phone
      FROM delivery_schedules_enhanced ds
      LEFT JOIN couriers c ON ds.courier_id = c.id
      WHERE ds.courier_id IS NOT NULL
      ORDER BY ds.created_at DESC
    `);
    
    if (assignedDeliveries.length === 0) {
      console.log('   No delivery schedules have couriers assigned!');
    } else {
      assignedDeliveries.forEach(delivery => {
        console.log(`   Schedule ID: ${delivery.id}, Order: ${delivery.order_number} (${delivery.order_type})`);
        console.log(`   Courier: ${delivery.courier_name} (${delivery.courier_phone})`);
        console.log(`   Status: ${delivery.delivery_status}, Date: ${delivery.delivery_date}`);
        console.log('');
      });
    }
    
    // 3. Check for the specific order from the screenshot (if we can find it)
    console.log('3. SEARCHING FOR RECENT CUSTOM ORDERS THAT MIGHT MATCH SCREENSHOT:');
    const [recentCustomOrders] = await connection.execute(`
      SELECT 
        co.id,
        co.custom_order_id,
        co.customer_name,
        co.customer_email,
        co.customer_phone,
        co.status,
        co.payment_status,
        ds.id as delivery_schedule_id,
        ds.courier_id,
        ds.delivery_status,
        c.name as courier_name,
        c.phone_number as courier_phone
      FROM custom_orders co
      LEFT JOIN delivery_schedules_enhanced ds ON ds.order_number = co.custom_order_id AND ds.order_type = 'custom_order'
      LEFT JOIN couriers c ON ds.courier_id = c.id
      WHERE co.payment_status = 'verified'
      ORDER BY co.created_at DESC
      LIMIT 10
    `);
    
    recentCustomOrders.forEach(order => {
      console.log(`   Order: ${order.custom_order_id}, Customer: ${order.customer_name}`);
      console.log(`   Phone: ${order.customer_phone}, Email: ${order.customer_email}`);
      console.log(`   Status: ${order.status}, Payment: ${order.payment_status}`);
      if (order.delivery_schedule_id) {
        console.log(`   Delivery Schedule: ${order.delivery_schedule_id}, Status: ${order.delivery_status}`);
        console.log(`   Courier: ${order.courier_name || 'NONE'} (${order.courier_phone || 'NONE'})`);
      } else {
        console.log('   No delivery schedule');
      }
      console.log('');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkCouriers();
