const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing'
};

async function testMappingLogic() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    const orderNumber = 'CUSTOM-8H-QMZ5R-2498';
    console.log(`\n🔍 Testing mapping logic for: ${orderNumber}`);
    
    // Step 1: Get from orders table
    const [ordersResult] = await connection.execute(`
      SELECT id, order_number, user_id, notes 
      FROM orders 
      WHERE order_number = ?
    `, [orderNumber]);

    if (ordersResult.length === 0) {
      console.log('❌ Order not found in orders table');
      return;
    }

    const order = ordersResult[0];
    console.log(`📋 Found in orders table: ID ${order.id}`);
    console.log(`   Notes: ${order.notes}`);

    // Step 2: Extract reference from notes
    const referenceMatch = order.notes.match(/Reference: (CUSTOM-[A-Z0-9-]+)/);
    if (!referenceMatch) {
      console.log('❌ No custom order reference found in notes');
      return;
    }

    const customOrderReference = referenceMatch[1];
    console.log(`🔍 Custom order reference: ${customOrderReference}`);

    // Step 3: Find in custom_orders table
    const [customOrdersResult] = await connection.execute(`
      SELECT id, custom_order_id, customer_name, status, delivery_status 
      FROM custom_orders 
      WHERE custom_order_id = ?
    `, [customOrderReference]);

    if (customOrdersResult.length === 0) {
      console.log('❌ Matching custom order not found');
      return;
    }

    const customOrder = customOrdersResult[0];
    console.log(`✅ Found matching custom order:`);
    console.log(`   Custom Order ID: ${customOrder.id}`);
    console.log(`   Reference: ${customOrder.custom_order_id}`);
    console.log(`   Customer: ${customOrder.customer_name}`);
    console.log(`   Status: ${customOrder.status}`);
    console.log(`   Delivery Status: ${customOrder.delivery_status}`);

    console.log(`\n🎯 MAPPING RESULT:`);
    console.log(`   Orders table ID ${order.id} -> Custom Orders table ID ${customOrder.id}`);
    console.log(`   Frontend should use ID ${customOrder.id} for API calls`);

    // Step 4: Test the delivery status update directly
    console.log(`\n🔍 Testing delivery status update on custom order ID ${customOrder.id}...`);
    
    await connection.execute(`
      UPDATE custom_orders 
      SET delivery_status = ?, 
          delivery_notes = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, ['delivered', 'Test update via direct mapping', customOrder.id]);

    console.log(`✅ Successfully updated delivery status to 'delivered'`);

    // Verify the update
    const [verifyResult] = await connection.execute(`
      SELECT delivery_status, delivery_notes, updated_at 
      FROM custom_orders 
      WHERE id = ?
    `, [customOrder.id]);

    if (verifyResult.length > 0) {
      const updated = verifyResult[0];
      console.log(`✅ Verified update:`);
      console.log(`   Delivery Status: ${updated.delivery_status}`);
      console.log(`   Delivery Notes: ${updated.delivery_notes}`);
      console.log(`   Updated At: ${updated.updated_at}`);
    }

  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testMappingLogic();
