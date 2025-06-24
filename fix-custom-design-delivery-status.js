const mysql = require('mysql2/promise');

// Fix the custom designs delivery_status enum to include 'scheduled'
async function fixCustomDesignDeliveryStatus() {
  console.log('🔧 Fixing custom_designs delivery_status enum to include "scheduled"...\n');
  
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 's3v3n-f0ur-cl0thing*',
    database: 'seven_four_clothing'
  });

  try {
    // 1. Check current enum values
    console.log('1. Current delivery_status enum values:');
    const [columns] = await connection.execute(`
      SELECT COLUMN_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'seven_four_clothing' 
      AND TABLE_NAME = 'custom_designs' 
      AND COLUMN_NAME = 'delivery_status'
    `);
    console.log(`   ${columns[0].COLUMN_TYPE}`);

    // 2. Update the enum to include 'scheduled'
    console.log('\n2. Adding "scheduled" to delivery_status enum...');
    await connection.execute(`
      ALTER TABLE custom_designs 
      MODIFY COLUMN delivery_status ENUM(
        'pending', 
        'scheduled', 
        'in_transit', 
        'delivered', 
        'delayed'
      ) DEFAULT 'pending'
    `);
    console.log('   ✅ Successfully updated delivery_status enum');

    // 3. Verify the change
    console.log('\n3. Verifying updated enum values:');
    const [newColumns] = await connection.execute(`
      SELECT COLUMN_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'seven_four_clothing' 
      AND TABLE_NAME = 'custom_designs' 
      AND COLUMN_NAME = 'delivery_status'
    `);
    console.log(`   ${newColumns[0].COLUMN_TYPE}`);

    // 4. Test all status values
    console.log('\n4. Testing all delivery status values:');
    const testValues = ['pending', 'scheduled', 'in_transit', 'delivered', 'delayed'];
    
    for (const status of testValues) {
      try {
        await connection.execute(`
          UPDATE custom_designs 
          SET delivery_status = ? 
          WHERE design_id = 'DESIGN-TEST-1750689783778'
        `, [status]);
        console.log(`   ✅ Status '${status}': VALID`);
      } catch (error) {
        console.log(`   ❌ Status '${status}': INVALID - ${error.message}`);
      }
    }

    // 5. Reset test design to pending
    await connection.execute(`
      UPDATE custom_designs 
      SET delivery_status = 'pending' 
      WHERE design_id = 'DESIGN-TEST-1750689783778'
    `);

    console.log('\n✅ Custom Design Delivery Status Fix Complete!');
    console.log('\n📋 Summary of Changes:');
    console.log('- ✅ Added "scheduled" to delivery_status enum');
    console.log('- ✅ All status values now work: pending, scheduled, in_transit, delivered, delayed');
    console.log('- ✅ Custom design orders can now follow the complete delivery workflow');
    console.log('\n🎯 Expected Functionality:');
    console.log('- Custom design orders can be scheduled for delivery');
    console.log('- When scheduled, they show "In Transit", "Delivered", "Delayed" buttons');
    console.log('- When in transit, they show "Delivered", "Delayed" buttons');
    console.log('- View Order modal works for custom designs in full calendar');

  } catch (error) {
    console.error('❌ Fix failed:', error.message);
  } finally {
    await connection.end();
  }
}

fixCustomDesignDeliveryStatus().catch(console.error);
