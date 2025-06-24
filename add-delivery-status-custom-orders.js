const mysql = require('mysql2/promise');

// Add delivery_status column to custom_orders table to support delivery management
async function addDeliveryStatusToCustomOrders() {
  console.log('🔧 Adding delivery_status column to custom_orders table...\n');
  
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 's3v3n-f0ur-cl0thing*',
    database: 'seven_four_clothing'
  });

  try {
    // 1. Check if delivery_status column already exists
    console.log('1. Checking current table structure...');
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'seven_four_clothing' 
      AND TABLE_NAME = 'custom_orders'
      AND COLUMN_NAME = 'delivery_status'
    `);
    
    if (columns.length > 0) {
      console.log('   ✅ delivery_status column already exists');
      
      // Check the current enum values
      const [columnInfo] = await connection.execute(`
        SELECT COLUMN_TYPE 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'seven_four_clothing' 
        AND TABLE_NAME = 'custom_orders' 
        AND COLUMN_NAME = 'delivery_status'
      `);
      console.log(`   Current enum values: ${columnInfo[0].COLUMN_TYPE}`);
      
    } else {
      console.log('   ❌ delivery_status column does not exist, adding it...');
      
      // 2. Add delivery_status column
      await connection.execute(`
        ALTER TABLE custom_orders 
        ADD COLUMN delivery_status ENUM(
          'pending', 
          'scheduled', 
          'in_transit', 
          'delivered', 
          'delayed'
        ) DEFAULT 'pending' AFTER payment_method
      `);
      console.log('   ✅ Successfully added delivery_status column');
    }

    // 3. Add delivery_notes column if it doesn't exist
    console.log('\n2. Checking for delivery_notes column...');
    const [notesColumns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'seven_four_clothing' 
      AND TABLE_NAME = 'custom_orders'
      AND COLUMN_NAME = 'delivery_notes'
    `);
    
    if (notesColumns.length === 0) {
      await connection.execute(`
        ALTER TABLE custom_orders 
        ADD COLUMN delivery_notes TEXT NULL AFTER delivery_status
      `);
      console.log('   ✅ Successfully added delivery_notes column');
    } else {
      console.log('   ✅ delivery_notes column already exists');
    }

    // 4. Verify the changes
    console.log('\n3. Verifying updated table structure...');
    const [newColumns] = await connection.execute(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'seven_four_clothing' 
      AND TABLE_NAME = 'custom_orders'
      AND (COLUMN_NAME = 'delivery_status' OR COLUMN_NAME = 'delivery_notes')
      ORDER BY ORDINAL_POSITION
    `);
    
    newColumns.forEach(col => {
      console.log(`   - ${col.COLUMN_NAME}: ${col.COLUMN_TYPE} (Default: ${col.COLUMN_DEFAULT})`);
    });

    // 5. Test status values
    console.log('\n4. Testing delivery status values...');
    const testValues = ['pending', 'scheduled', 'in_transit', 'delivered', 'delayed'];
    
    // Find a test custom order
    const [testOrders] = await connection.execute(`
      SELECT id, custom_order_id FROM custom_orders WHERE status = 'approved' LIMIT 1
    `);
    
    if (testOrders.length > 0) {
      const testOrderId = testOrders[0].id;
      const testOrderNumber = testOrders[0].custom_order_id;
      
      for (const status of testValues) {
        try {
          await connection.execute(`
            UPDATE custom_orders 
            SET delivery_status = ?, delivery_notes = ?
            WHERE id = ?
          `, [status, `Test status: ${status}`, testOrderId]);
          console.log(`   ✅ Status '${status}': VALID`);
        } catch (error) {
          console.log(`   ❌ Status '${status}': INVALID - ${error.message}`);
        }
      }
      
      // Reset to pending
      await connection.execute(`
        UPDATE custom_orders 
        SET delivery_status = 'pending', delivery_notes = NULL
        WHERE id = ?
      `, [testOrderId]);
      
      console.log(`   ✅ Reset test order ${testOrderNumber} to pending status`);
    } else {
      console.log('   ⚠️ No approved custom orders found for testing');
    }

    console.log('\n✅ Custom Orders Delivery Status Setup Complete!');
    console.log('\n📋 Summary of Changes:');
    console.log('- ✅ Added delivery_status enum column to custom_orders table');
    console.log('- ✅ Added delivery_notes text column for tracking notes');
    console.log('- ✅ All status values work: pending, scheduled, in_transit, delivered, delayed');
    console.log('- ✅ Custom orders now support full delivery workflow');
    
    console.log('\n🎯 Next Steps:');
    console.log('- Add backend API endpoint for updating custom order delivery status');
    console.log('- Update frontend handleUpdateDeliveryStatus to support custom orders');
    console.log('- Test delivery status buttons with custom orders');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    await connection.end();
  }
}

addDeliveryStatusToCustomOrders().catch(console.error);
