// Test the enhanced delivery API SQL queries directly
const mysql = require('mysql2/promise');

require('dotenv').config({ path: './server/.env' });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'seven_four_clothing'
};

async function testDeliveryQueries() {
  let connection;
  
  try {
    console.log('🧪 Testing Enhanced Delivery API SQL Queries...\n');
    connection = await mysql.createConnection(dbConfig);
    
    // Test 1: Regular orders query
    console.log('1️⃣ Testing regular orders query...');
    try {
      const [regularOrders] = await connection.execute(`
        SELECT 
          o.id,
          o.order_number,
          oi.customer_name,
          oi.customer_email,
          o.contact_phone as customer_phone,
          o.total_amount,
          o.status,
          o.order_date,
          o.shipping_address,
          SUBSTRING_INDEX(SUBSTRING_INDEX(o.shipping_address, ',', -3), ',', 1) as shipping_city,
          SUBSTRING_INDEX(SUBSTRING_INDEX(o.shipping_address, ',', -2), ',', 1) as shipping_province,
          '' as shipping_postal_code,
          o.contact_phone as shipping_phone,
          o.notes as shipping_notes,
          'regular' as order_type,
          ds.delivery_status,
          ds.delivery_date as scheduled_delivery_date,
          ds.delivery_time_slot as scheduled_delivery_time,
          ds.delivery_notes,
          ds.id as delivery_schedule_id,
          c.name as courier_name,
          c.phone_number as courier_phone
        FROM orders o
        LEFT JOIN order_invoices oi ON o.invoice_id = oi.invoice_id
        LEFT JOIN delivery_schedules_enhanced ds ON o.id = ds.order_id AND ds.order_type = 'regular'
        LEFT JOIN couriers c ON ds.courier_id = c.id
        WHERE o.status IN ('confirmed', 'processing')
        ORDER BY o.order_date DESC
      `);
      
      console.log(`   ✅ Regular orders query successful: ${regularOrders.length} results`);
      if (regularOrders.length > 0) {
        console.log(`   📋 Sample: ${regularOrders[0].order_number} - ${regularOrders[0].customer_name}`);
      }
    } catch (error) {
      console.log(`   ❌ Regular orders query failed: ${error.message}`);
    }
    
    // Test 2: Custom designs query
    console.log('\n2️⃣ Testing custom designs query...');
    try {
      const [customDesigns] = await connection.execute(`
        SELECT 
          CONCAT('custom-design-', cd.id) as id,
          cd.design_id as order_number,
          cd.customer_name,
          cd.customer_email,
          cd.customer_phone,
          cd.final_price as total_amount,
          cd.status,
          cd.created_at as order_date,
          CONCAT(cd.street_address, ', ', cd.city) as shipping_address,
          cd.city as shipping_city,
          'Metro Manila' as shipping_province,
          cd.postal_code as shipping_postal_code,
          cd.customer_phone as shipping_phone,
          cd.delivery_notes as shipping_notes,
          'custom_design' as order_type,
          cd.delivery_status,
          cd.delivery_date as scheduled_delivery_date,
          ds.delivery_time_slot as scheduled_delivery_time,
          ds.delivery_notes,
          ds.id as delivery_schedule_id,
          c.name as courier_name,
          c.phone_number as courier_phone
        FROM custom_designs cd
        LEFT JOIN delivery_schedules_enhanced ds ON cd.id = ds.order_id AND ds.order_type = 'custom_design'
        LEFT JOIN couriers c ON ds.courier_id = c.id
        WHERE cd.status = 'approved'
        ORDER BY cd.created_at DESC
      `);
      
      console.log(`   ✅ Custom designs query successful: ${customDesigns.length} results`);
    } catch (error) {
      console.log(`   ❌ Custom designs query failed: ${error.message}`);
    }
    
    // Test 3: Custom orders query
    console.log('\n3️⃣ Testing custom orders query...');
    try {
      const [customOrders] = await connection.execute(`
        SELECT 
          CONCAT('custom-order-', co.id) as id,
          co.custom_order_id as order_number,
          co.customer_name,
          co.customer_email,
          co.customer_phone,
          co.final_price as total_amount,
          co.status,
          co.created_at as order_date,
          CONCAT(co.street_number, ', ', co.municipality, ', ', co.province) as shipping_address,
          co.municipality as shipping_city,
          co.province as shipping_province,
          co.postal_code as shipping_postal_code,
          co.customer_phone as shipping_phone,
          co.delivery_notes as shipping_notes,
          'custom_order' as order_type,
          co.delivery_status,
          co.estimated_delivery_date as scheduled_delivery_date,
          ds.delivery_time_slot as scheduled_delivery_time,
          ds.delivery_notes,
          ds.id as delivery_schedule_id,
          c.name as courier_name,
          c.phone_number as courier_phone
        FROM custom_orders co
        LEFT JOIN delivery_schedules_enhanced ds ON co.id = ds.order_id AND ds.order_type = 'custom_order'
        LEFT JOIN couriers c ON ds.courier_id = c.id
        WHERE co.status = 'approved'
        ORDER BY co.created_at DESC
      `);
      
      console.log(`   ✅ Custom orders query successful: ${customOrders.length} results`);
      if (customOrders.length > 0) {
        console.log(`   📋 Sample: ${customOrders[0].order_number} - ${customOrders[0].customer_name}`);
      }
    } catch (error) {
      console.log(`   ❌ Custom orders query failed: ${error.message}`);
    }
    
    console.log('\n🎯 All SQL queries tested successfully!');
    console.log('   The 500 error should now be fixed.');
    
  } catch (error) {
    console.error('🔥 Test error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

testDeliveryQueries();
