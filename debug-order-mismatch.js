const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing'
};

async function debugOrderMismatch() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    console.log('🔍 Investigating order ID 47 and order number CUSTOM-8H-QMZ5R-2498...\n');

    // Check what's in the orders table with ID 47
    console.log('1️⃣ Checking orders table for ID 47...');
    const [ordersTable] = await connection.execute(`
      SELECT o.id, o.order_number, o.total_amount, o.status, o.created_at, o.user_id,
             u.first_name, u.last_name, u.email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.user_id
      WHERE o.id = 47
    `);

    if (ordersTable.length > 0) {
      const order = ordersTable[0];
      console.log('📋 Found in orders table:');
      console.log(`  - ID: ${order.id}`);
      console.log(`  - Order Number: ${order.order_number}`);
      console.log(`  - Customer: ${order.first_name} ${order.last_name} (${order.email})`);
      console.log(`  - Amount: ₱${order.total_amount}`);
      console.log(`  - Status: ${order.status}`);
      console.log(`  - Date: ${order.created_at}`);
      
      if (order.order_number.includes('CUSTOM')) {
        console.log('⚠️ THIS IS THE PROBLEM:');
        console.log('  - Order number has CUSTOM format but is in orders table');
        console.log('  - Frontend thinks it\'s a custom order');
        console.log('  - Backend can\'t find it in custom_orders table');
      }
    } else {
      console.log('❌ Not found in orders table');
    }

    // Check custom_orders table for any similar entries
    console.log('\n2️⃣ Checking custom_orders table for similar order...');
    const [customOrdersTable] = await connection.execute(`
      SELECT id, custom_order_id, customer_name, estimated_price, status, created_at
      FROM custom_orders 
      WHERE custom_order_id LIKE '%QMZ5R%' OR custom_order_id = 'CUSTOM-8H-QMZ5R-2498'
    `);

    if (customOrdersTable.length > 0) {
      console.log('📋 Found similar entries in custom_orders table:');
      customOrdersTable.forEach(order => {
        console.log(`  - ID: ${order.id}, Order: ${order.custom_order_id}, Customer: ${order.customer_name}, Price: ₱${order.estimated_price}, Status: ${order.status}`);
      });
    } else {
      console.log('❌ No similar entries found in custom_orders table');
    }

    // Check if there's a custom order that should be linked to this
    console.log('\n3️⃣ Looking for related custom order...');
    const [relatedCustomOrder] = await connection.execute(`
      SELECT id, custom_order_id, customer_name, estimated_price, status, created_at
      FROM custom_orders 
      WHERE custom_order_id LIKE '%QMZ5R%'
    `);

    if (relatedCustomOrder.length > 0) {
      console.log('📋 Found related custom order:');
      relatedCustomOrder.forEach(order => {
        console.log(`  - Custom Order ID: ${order.id}`);
        console.log(`  - Custom Order Number: ${order.custom_order_id}`);
        console.log(`  - Customer: ${order.customer_name}`);
        console.log(`  - Price: ₱${order.estimated_price}`);
        console.log(`  - Status: ${order.status}`);
        console.log(`  - Date: ${order.created_at}`);
      });
      
      console.log('\n💡 POTENTIAL SOLUTION:');
      console.log('The frontend should use the custom_orders table ID, not the orders table ID');
      console.log(`Instead of calling /custom-orders/47/delivery-status`);
      console.log(`It should call /custom-orders/${relatedCustomOrder[0].id}/delivery-status`);
    }

    // Check delivery schedules to see how this order is stored there
    console.log('\n4️⃣ Checking delivery schedules...');
    const [deliverySchedules] = await connection.execute(`
      SELECT id, order_id, order_number, customer_name, order_type, delivery_status
      FROM delivery_schedules_enhanced 
      WHERE order_id = 47 OR order_number = 'CUSTOM-8H-QMZ5R-2498' OR order_id = 'custom-order-47'
    `);

    if (deliverySchedules.length > 0) {
      console.log('📋 Found in delivery schedules:');
      deliverySchedules.forEach(schedule => {
        console.log(`  - Schedule ID: ${schedule.id}`);
        console.log(`  - Order ID: ${schedule.order_id}`);
        console.log(`  - Order Number: ${schedule.order_number}`);
        console.log(`  - Customer: ${schedule.customer_name}`);
        console.log(`  - Order Type: ${schedule.order_type}`);
        console.log(`  - Delivery Status: ${schedule.delivery_status}`);
      });
    }

    console.log('\n🎯 DIAGNOSIS:');
    console.log('The issue is that:');
    console.log('1. Order 47 in orders table has a CUSTOM- prefix order number');
    console.log('2. Frontend sees CUSTOM- and thinks it\'s a custom order');
    console.log('3. Frontend tries to update custom_orders table with ID 47');
    console.log('4. But ID 47 doesn\'t exist in custom_orders table');
    console.log('5. Backend returns 404 "Custom order not found"');

    console.log('\n🔧 SOLUTION NEEDED:');
    console.log('Fix the frontend logic to properly identify custom orders vs regular orders with custom-like names');

  } catch (error) {
    console.error('❌ Database error:', error.message);
    console.error('Full error:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

debugOrderMismatch();
