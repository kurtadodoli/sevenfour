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

async function debugCourierJoin() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    
    console.log('🔍 Debugging courier join for custom orders...\n');
    
    // First, check if we have any custom orders with confirmed payment
    console.log('1. CUSTOM ORDERS WITH CONFIRMED PAYMENT:');
    const [customOrders] = await connection.execute(`
      SELECT 
        co.id,
        co.custom_order_id,
        co.customer_name,
        co.status,
        co.payment_status,
        co.payment_verified_at
      FROM custom_orders co
      WHERE co.status IN ('confirmed', 'approved', 'completed')
      AND co.payment_status = 'verified'
      AND co.payment_verified_at IS NOT NULL
      ORDER BY co.created_at DESC
      LIMIT 5
    `);
    
    customOrders.forEach(order => {
      console.log(`   ID: ${order.id}, Order#: ${order.custom_order_id}, Customer: ${order.customer_name}`);
      console.log(`   Status: ${order.status}, Payment: ${order.payment_status}, Verified: ${order.payment_verified_at}`);
      console.log('');
    });
    
    // Check delivery schedules for these custom orders
    console.log('2. DELIVERY SCHEDULES FOR CUSTOM ORDERS:');
    const [deliverySchedules] = await connection.execute(`
      SELECT 
        ds.id,
        ds.order_number,
        ds.order_type,
        ds.courier_id,
        ds.delivery_status,
        c.name as courier_name,
        c.phone_number as courier_phone
      FROM delivery_schedules_enhanced ds
      LEFT JOIN couriers c ON ds.courier_id = c.id
      WHERE ds.order_type = 'custom_order'
      ORDER BY ds.created_at DESC
      LIMIT 5
    `);
    
    deliverySchedules.forEach(schedule => {
      console.log(`   Schedule ID: ${schedule.id}, Order#: ${schedule.order_number}`);
      console.log(`   Courier ID: ${schedule.courier_id}, Name: ${schedule.courier_name}, Phone: ${schedule.courier_phone}`);
      console.log(`   Status: ${schedule.delivery_status}`);
      console.log('');
    });
    
    // Now run the exact same query that the backend uses to get custom orders
    console.log('3. BACKEND QUERY RESULT FOR CUSTOM ORDERS:');
    const [backendResult] = await connection.execute(`
      SELECT 
        co.id,
        co.custom_order_id as order_number,
        co.customer_name,
        co.customer_email,
        co.customer_phone,
        COALESCE(co.final_price, co.estimated_price, 0) as total_amount,
        co.status,
        co.payment_status,
        co.payment_verified_at,
        co.created_at as order_date,
        CONCAT(co.street_number, ', ', co.municipality, ', ', co.province) as shipping_address,
        co.municipality as shipping_city,
        co.province as shipping_province,
        co.postal_code as shipping_postal_code,
        co.customer_phone as shipping_phone,
        co.special_instructions as shipping_notes,
        'custom_order' as order_type,
        COALESCE(co.delivery_status, ds.delivery_status) as delivery_status,
        ds.delivery_date as scheduled_delivery_date,
        ds.delivery_time_slot as scheduled_delivery_time,
        COALESCE(co.delivery_notes, ds.delivery_notes) as delivery_notes,
        ds.id as delivery_schedule_id,
        c.name as courier_name,
        c.phone_number as courier_phone,
        latest_payment.verified_at as latest_payment_verified_at,
        latest_payment.payment_amount as latest_payment_amount
      FROM custom_orders co
      LEFT JOIN (
        SELECT 
          custom_order_id,
          payment_amount,
          verified_at,
          ROW_NUMBER() OVER (PARTITION BY custom_order_id ORDER BY verified_at DESC) as rn
        FROM custom_order_payments 
        WHERE payment_status = 'verified'
      ) latest_payment ON co.custom_order_id = latest_payment.custom_order_id AND latest_payment.rn = 1
      LEFT JOIN (
        SELECT 
          order_number,
          delivery_date,
          delivery_time_slot,
          delivery_status,
          delivery_notes,
          courier_id,
          id,
          ROW_NUMBER() OVER (PARTITION BY order_number ORDER BY created_at DESC) as rn
        FROM delivery_schedules_enhanced 
        WHERE order_type = 'custom_order'
      ) ds ON ds.order_number = co.custom_order_id AND ds.rn = 1
      LEFT JOIN couriers c ON ds.courier_id = c.id
      WHERE co.status IN ('confirmed', 'approved', 'completed')
      AND co.payment_status = 'verified'
      AND co.payment_verified_at IS NOT NULL
      ORDER BY co.created_at DESC
      LIMIT 5
    `);
    
    console.log(`Found ${backendResult.length} custom orders from backend query:`);
    backendResult.forEach(order => {
      console.log(`   Order: ${order.order_number}, Customer: ${order.customer_name}`);
      console.log(`   Delivery Status: ${order.delivery_status}, Schedule ID: ${order.delivery_schedule_id}`);
      console.log(`   Courier Name: ${order.courier_name || 'NULL'}, Courier Phone: ${order.courier_phone || 'NULL'}`);
      console.log(`   Scheduled Date: ${order.scheduled_delivery_date || 'NULL'}, Time: ${order.scheduled_delivery_time || 'NULL'}`);
      console.log('');
    });
    
    // Check for specific order mentioned in conversation
    console.log('4. SPECIFIC ORDER CHECK (CUO17517208066847444):');
    const [specificOrder] = await connection.execute(`
      SELECT 
        co.id,
        co.custom_order_id as order_number,
        co.customer_name,
        co.status,
        co.payment_status,
        co.payment_verified_at
      FROM custom_orders co
      WHERE co.custom_order_id = 'CUO17517208066847444'
    `);
    
    if (specificOrder.length > 0) {
      console.log(`   Found order: ${specificOrder[0].order_number}`);
      console.log(`   Status: ${specificOrder[0].status}, Payment: ${specificOrder[0].payment_status}`);
      console.log(`   Verified: ${specificOrder[0].payment_verified_at}`);
      
      // Check delivery schedule for this specific order
      const [specificDelivery] = await connection.execute(`
        SELECT 
          ds.*,
          c.name as courier_name,
          c.phone_number as courier_phone
        FROM delivery_schedules_enhanced ds
        LEFT JOIN couriers c ON ds.courier_id = c.id
        WHERE ds.order_number = 'CUO17517208066847444'
        ORDER BY ds.created_at DESC
      `);
      
      if (specificDelivery.length > 0) {
        console.log(`   Delivery Schedule Found: ID ${specificDelivery[0].id}`);
        console.log(`   Courier ID: ${specificDelivery[0].courier_id}`);
        console.log(`   Courier Name: ${specificDelivery[0].courier_name || 'NULL'}`);
        console.log(`   Courier Phone: ${specificDelivery[0].courier_phone || 'NULL'}`);
        console.log(`   Delivery Status: ${specificDelivery[0].delivery_status}`);
      } else {
        console.log('   No delivery schedule found for this order');
      }
    } else {
      console.log('   Order not found');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

debugCourierJoin();
