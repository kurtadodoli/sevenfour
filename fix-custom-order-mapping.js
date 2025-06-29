const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing'
};

async function fixCustomOrderMapping() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    console.log('🔧 Fixing custom order ID mapping issue...\n');

    // The problematic order details
    const orderNumber = 'CUSTOM-8H-QMZ5R-2498';
    const ordersTableId = 47;
    const relatedCustomOrderId = 4; // Found from our previous search

    console.log('1️⃣ Current situation:');
    console.log(`  - Orders table ID: ${ordersTableId}`);
    console.log(`  - Order number: ${orderNumber}`);
    console.log(`  - Related custom_orders ID: ${relatedCustomOrderId}`);

    // Get the custom order details
    const [customOrder] = await connection.execute(`
      SELECT id, custom_order_id, customer_name, estimated_price, status
      FROM custom_orders 
      WHERE id = ?
    `, [relatedCustomOrderId]);

    if (customOrder.length === 0) {
      console.log('❌ Custom order not found');
      return;
    }

    const customOrderData = customOrder[0];
    console.log('\n2️⃣ Related custom order details:');
    console.log(`  - Custom Order ID: ${customOrderData.id}`);
    console.log(`  - Custom Order Number: ${customOrderData.custom_order_id}`);
    console.log(`  - Customer: ${customOrderData.customer_name}`);
    console.log(`  - Price: ₱${customOrderData.estimated_price}`);
    console.log(`  - Status: ${customOrderData.status}`);

    // Check if there's a delivery schedule that needs updating
    console.log('\n3️⃣ Checking delivery schedules...');
    const [deliverySchedules] = await connection.execute(`
      SELECT id, order_id, order_number, order_type, customer_name
      FROM delivery_schedules_enhanced 
      WHERE order_id = ? OR order_number = ?
    `, [ordersTableId, orderNumber]);

    if (deliverySchedules.length > 0) {
      console.log('📋 Found delivery schedules that reference this order:');
      deliverySchedules.forEach(schedule => {
        console.log(`  - Schedule ID: ${schedule.id}, Order ID: ${schedule.order_id}, Order Number: ${schedule.order_number}, Type: ${schedule.order_type}`);
      });

      // Update delivery schedules to reference the correct custom order
      console.log('\n🔧 Updating delivery schedules to reference correct custom order...');
      
      for (const schedule of deliverySchedules) {
        await connection.execute(`
          UPDATE delivery_schedules_enhanced 
          SET order_id = ?, order_type = 'custom_order'
          WHERE id = ?
        `, [`custom-order-${relatedCustomOrderId}`, schedule.id]);
        
        console.log(`✅ Updated delivery schedule ${schedule.id} to reference custom-order-${relatedCustomOrderId}`);
      }
    }

    // The main fix: Update the frontend to use the correct mapping
    console.log('\n4️⃣ Creating a mapping solution...');
    
    // Create a mapping table or update the order to reference the correct custom order
    // For this specific case, we'll document the correct mapping
    
    console.log('📋 CORRECT MAPPING:');
    console.log(`  - Frontend order ID 47 should map to custom_orders ID ${relatedCustomOrderId}`);
    console.log(`  - API call should be: PATCH /custom-orders/${relatedCustomOrderId}/delivery-status`);
    console.log(`  - NOT: PATCH /custom-orders/47/delivery-status`);

    // Let's also check if there are other similar mismatches
    console.log('\n5️⃣ Checking for other potential mismatches...');
    
    const [otherCustomOrders] = await connection.execute(`
      SELECT o.id as orders_id, o.order_number as orders_number, o.total_amount,
             co.id as custom_orders_id, co.custom_order_id, co.estimated_price,
             o.created_at as orders_date, co.created_at as custom_orders_date
      FROM orders o
      JOIN custom_orders co ON (
        o.total_amount = co.estimated_price AND
        ABS(TIMESTAMPDIFF(MINUTE, o.created_at, co.created_at)) < 60
      )
      WHERE o.order_number LIKE 'CUSTOM-%'
    `);

    if (otherCustomOrders.length > 0) {
      console.log('⚠️ Found other potential mismatches:');
      otherCustomOrders.forEach(match => {
        console.log(`  - Orders ID: ${match.orders_id} (${match.orders_number}) -> Custom Orders ID: ${match.custom_orders_id} (${match.custom_order_id})`);
      });
    }

    console.log('\n✅ Analysis complete. The fix needed is:');
    console.log('1. Update frontend to properly map custom order IDs');
    console.log('2. Use custom_orders table ID, not orders table ID');
    console.log('3. For order 47, use custom order ID 4 instead');

  } catch (error) {
    console.error('❌ Database error:', error.message);
    console.error('Full error:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

fixCustomOrderMapping();
