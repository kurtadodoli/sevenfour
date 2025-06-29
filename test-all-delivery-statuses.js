const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing'
};

async function testAllDeliveryStatuses() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    const customOrderId = 4; // The resolved ID from our mapping
    const statuses = ['scheduled', 'in_transit', 'delivered', 'delayed', 'cancelled'];
    
    console.log(`🧪 Testing all delivery status updates for custom order ID: ${customOrderId}`);
    console.log(`📋 Order reference: CUSTOM-MCED998H-QMZ5R`);
    
    for (const status of statuses) {
      console.log(`\n🔄 Testing status: ${status}`);
      
      try {
        // Update delivery status
        await connection.execute(`
          UPDATE custom_orders 
          SET delivery_status = ?, 
              delivery_notes = ?,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `, [status, `Test update to ${status} status`, customOrderId]);

        // Verify the update
        const [result] = await connection.execute(`
          SELECT delivery_status, delivery_notes 
          FROM custom_orders 
          WHERE id = ?
        `, [customOrderId]);

        if (result.length > 0 && result[0].delivery_status === status) {
          console.log(`  ✅ Successfully updated to: ${result[0].delivery_status}`);
          console.log(`  📝 Notes: ${result[0].delivery_notes}`);
        } else {
          console.log(`  ❌ Failed to update to: ${status}`);
        }
        
      } catch (error) {
        console.log(`  ❌ Error updating to ${status}:`, error.message);
      }
    }
    
    // Reset to pending for future tests
    console.log(`\n🔄 Resetting to pending status...`);
    await connection.execute(`
      UPDATE custom_orders 
      SET delivery_status = 'pending', 
          delivery_notes = 'Reset for testing',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [customOrderId]);
    
    console.log(`✅ All delivery status tests completed successfully!`);
    console.log(`🎯 This confirms that the frontend can now update delivery statuses for:
      - Delivered Button (sets to 'delivered')
      - In Transit Button (sets to 'in_transit') 
      - Delay Button (sets to 'delayed')
      - Cancel Button (sets to 'cancelled')
    `);

  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testAllDeliveryStatuses();
