const mysql = require('mysql2/promise');

async function fixDeliverySchedules() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root', 
      password: 's3v3n-f0ur-cl0thing*',
      database: 'seven_four_clothing'
    });

    console.log('🔧 Fixing delivery schedules...');
    
    // Get orders with scheduled delivery dates but no delivery schedule entries
    const [ordersWithSchedules] = await connection.execute(
      'SELECT id, order_number, scheduled_delivery_date, user_id, shipping_address, contact_phone FROM orders WHERE scheduled_delivery_date IS NOT NULL AND status IN ("confirmed", "Order Received")'
    );
    
    console.log(`📦 Found ${ordersWithSchedules.length} orders with scheduled delivery dates:`);
    
    for (const order of ordersWithSchedules) {
      console.log(`  - ${order.order_number} (ID: ${order.id}): ${order.scheduled_delivery_date}`);
      
      // Check if delivery schedule already exists
      const [existing] = await connection.execute(
        'SELECT * FROM delivery_schedules WHERE order_id = ? AND order_type = "regular"',
        [order.id]
      );
      
      if (existing.length === 0) {
        // Insert into delivery_schedules table
        console.log(`    ➕ Adding to delivery_schedules...`);
        await connection.execute(
          `INSERT INTO delivery_schedules (
            order_id, order_type, customer_id, delivery_date, 
            delivery_address, delivery_city, delivery_postal_code, delivery_province,
            delivery_contact_phone, courier_name, delivery_status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            order.id, 
            'regular', 
            order.user_id, 
            order.scheduled_delivery_date,
            order.shipping_address || 'Address not specified',
            'Not specified',
            '0000',
            'Not specified',
            order.contact_phone || 'Phone not specified',
            'Not Assigned', 
            'scheduled'
          ]
        );
        console.log(`    ✅ Added successfully!`);
      } else {
        console.log(`    ⚠️  Already exists in delivery_schedules`);
      }
    }
    
    // Verify the additions
    console.log('\n🔍 Verifying delivery schedules after additions:');
    const [allSchedules] = await connection.execute(
      'SELECT ds.*, o.order_number FROM delivery_schedules ds LEFT JOIN orders o ON ds.order_id = o.id ORDER BY ds.delivery_date'
    );
    
    console.log(`📅 Total delivery schedules: ${allSchedules.length}`);
    allSchedules.forEach(schedule => {
      console.log(`  - ${schedule.delivery_date}: ${schedule.order_number} (${schedule.courier_name || 'Not Assigned'})`);
    });
    
    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixDeliverySchedules();
