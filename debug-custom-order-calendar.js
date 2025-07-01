const mysql = require('mysql2/promise');
require('dotenv').config({ path: './server/.env' });

async function debugCustomOrderCalendar() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'supreme_fish_cake'
    });

    console.log('🔍 Debugging Custom Order Calendar Display...\n');

    // First check the orders table structure
    console.log('📋 ORDERS TABLE STRUCTURE:');
    const [columns] = await connection.execute(`DESCRIBE orders`);
    console.log('Available columns:', columns.map(col => col.Field).join(', '));
    console.log('');

    // Check if there's a custom_orders table
    console.log('📋 CHECKING FOR CUSTOM_ORDERS TABLE:');
    try {
      const [customOrdersColumns] = await connection.execute(`DESCRIBE custom_orders`);
      console.log('Custom Orders table columns:', customOrdersColumns.map(col => col.Field).join(', '));
      console.log('');
    } catch (error) {
      console.log('❌ No custom_orders table found');
      console.log('');
    }

    // Show all tables
    console.log('📋 ALL TABLES IN DATABASE:');
    const [tables] = await connection.execute(`SHOW TABLES`);
    console.log('Available tables:', tables.map(table => Object.values(table)[0]).join(', '));
    console.log('');

    // Check delivery_schedules table structure
    console.log('📋 DELIVERY_SCHEDULES TABLE STRUCTURE:');
    const [scheduleColumns] = await connection.execute(`DESCRIBE delivery_schedules`);
    console.log('Available columns:', scheduleColumns.map(col => col.Field).join(', '));
    console.log('');

    // Check recent orders
    console.log('📋 RECENT ORDERS (ALL TYPES):');
    const [recentOrders] = await connection.execute(`
      SELECT id, order_number, status, delivery_status, scheduled_delivery_date, 
             total_amount, created_at
      FROM orders 
      ORDER BY created_at DESC 
      LIMIT 10
    `);

    if (recentOrders.length === 0) {
      console.log('❌ No orders found');
    } else {
      recentOrders.forEach((order, index) => {
        console.log(`${index + 1}. Order ${order.order_number} (ID: ${order.id})`);
        console.log(`   Status: ${order.status || 'NULL'}`);
        console.log(`   Delivery Status: ${order.delivery_status || 'NULL'}`);
        console.log(`   Scheduled Date: ${order.scheduled_delivery_date || 'NULL'}`);
        console.log(`   Amount: ₱${parseFloat(order.total_amount || 0).toFixed(2)}`);
        console.log(`   Created: ${order.created_at}`);
        console.log('');
      });
    }

    // Check delivery_schedules table
    console.log('\n📅 DELIVERY SCHEDULES:');
    const [deliverySchedules] = await connection.execute(`
      SELECT ds.*, o.order_number
      FROM delivery_schedules ds
      JOIN orders o ON ds.order_id = o.id
      ORDER BY ds.delivery_date DESC
      LIMIT 10
    `);

    if (deliverySchedules.length === 0) {
      console.log('❌ No delivery schedules found');
    } else {
      deliverySchedules.forEach((schedule, index) => {
        console.log(`${index + 1}. Schedule ID: ${schedule.id}`);
        console.log(`   Order: ${schedule.order_number}`);
        console.log(`   Order ID: ${schedule.order_id}`);
        console.log(`   Delivery Date: ${schedule.delivery_date}`);
        console.log(`   Time Slot: ${schedule.delivery_time_slot || 'NULL'}`);
        console.log(`   Status: ${schedule.delivery_status || 'NULL'}`);
        console.log('');
      });
    }

    // Check recent API call logs for delivery data - simplified
    console.log('\n🔄 CHECKING DELIVERY STATUS DATA:');
    
    const [enhancedData] = await connection.execute(`
      SELECT 
        o.id, 
        o.order_number, 
        o.status,
        o.delivery_status,
        o.scheduled_delivery_date,
        o.total_amount,
        o.created_at,
        COALESCE(ds.delivery_status, o.delivery_status, 'pending') as unified_status,
        ds.delivery_date as schedule_delivery_date,
        ds.delivery_time_slot,
        ds.delivery_notes
      FROM orders o
      LEFT JOIN delivery_schedules ds ON o.id = ds.order_id
      ORDER BY o.created_at DESC
      LIMIT 5
    `);

    console.log('📡 Enhanced delivery data for recent orders:');
    if (enhancedData.length === 0) {
      console.log('❌ No data returned from enhanced query');
    } else {
      enhancedData.forEach((data, index) => {
        console.log(`${index + 1}. ${data.order_number}`);
        console.log(`   Order Status: ${data.status || 'NULL'}`);
        console.log(`   Unified Status: ${data.unified_status}`);
        console.log(`   Order Scheduled Date: ${data.scheduled_delivery_date || 'NULL'}`);
        console.log(`   Schedule Table Date: ${data.schedule_delivery_date || 'NULL'}`);
        console.log(`   Time Slot: ${data.delivery_time_slot || 'NULL'}`);
        console.log('');
      });
    }

    // Check custom orders data properly
    console.log('\n🎨 CHECKING FOR CUSTOM ORDER MARKERS:');
    
    // Check if custom_orders table exists and has data
    try {
      const [customOrdersData] = await connection.execute(`
        SELECT id, custom_order_id, customer_name, delivery_status, 
               estimated_delivery_date, created_at
        FROM custom_orders 
        ORDER BY created_at DESC 
        LIMIT 5
      `);
      
      if (customOrdersData.length === 0) {
        console.log('📝 Custom_orders table exists but is empty');
      } else {
        console.log('📝 Found custom order data:');
        customOrdersData.forEach((custom, index) => {
          console.log(`${index + 1}. Custom Order ID: ${custom.custom_order_id}`);
          console.log(`   Database ID: ${custom.id}`);
          console.log(`   Customer: ${custom.customer_name}`);
          console.log(`   Delivery Status: ${custom.delivery_status || 'NULL'}`);
          console.log(`   Estimated Delivery: ${custom.estimated_delivery_date || 'NULL'}`);
          console.log(`   Created: ${custom.created_at}`);
          console.log('');
        });
      }
    } catch (error) {
      console.log('❌ Error accessing custom_orders table:', error.message);
    }

    // Check if custom_designs table has data  
    try {
      const [customDesigns] = await connection.execute(`
        SELECT id, order_number, customer_name, delivery_status, 
               created_at
        FROM custom_designs 
        ORDER BY created_at DESC 
        LIMIT 5
      `);
      
      if (customDesigns.length === 0) {
        console.log('📝 Custom_designs table exists but is empty');
      } else {
        console.log('📝 Found custom design data:');
        customDesigns.forEach((design, index) => {
          console.log(`${index + 1}. Design Order: ${design.order_number || design.id}`);
          console.log(`   Customer: ${design.customer_name}`);
          console.log(`   Delivery Status: ${design.delivery_status || 'NULL'}`);
          console.log(`   Created: ${design.created_at}`);
          console.log('');
        });
      }
    } catch (error) {
      console.log('❌ Error accessing custom_designs table:', error.message);
    }

    // Check which table order ID 19 belongs to (the custom order in delivery_schedules)
    console.log('\n🔍 INVESTIGATING ORDER ID 19 (CUSTOM-A7-IN3P8-8793):');
    
    // Check if it's in orders table
    try {
      const [order19] = await connection.execute(`
        SELECT * FROM orders WHERE id = 19
      `);
      
      if (order19.length > 0) {
        console.log('✅ Found in orders table:', order19[0]);
      } else {
        console.log('❌ Not found in orders table');
      }
    } catch (error) {
      console.log('❌ Error checking orders table:', error.message);
    }
    
    // Check custom_orders
    try {
      const [custom19] = await connection.execute(`
        SELECT * FROM custom_orders WHERE id = 19 OR custom_order_id = 'CUSTOM-A7-IN3P8-8793'
      `);
      
      if (custom19.length > 0) {
        console.log('✅ Found in custom_orders table:', custom19[0]);
      } else {
        console.log('❌ Not found in custom_orders table');
      }
    } catch (error) {
      console.log('❌ Error checking custom_orders table:', error.message);
    }
    
    // Check custom_designs  
    try {
      const [design19] = await connection.execute(`
        SELECT * FROM custom_designs WHERE id = 19 OR order_number = 'CUSTOM-A7-IN3P8-8793'
      `);
      
      if (design19.length > 0) {
        console.log('✅ Found in custom_designs table:', design19[0]);
      } else {
        console.log('❌ Not found in custom_designs table');
      }
    } catch (error) {
      console.log('❌ Error checking custom_designs table:', error.message);
    }

  } catch (error) {
    console.error('❌ Error during debug:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the debug
debugCustomOrderCalendar();
