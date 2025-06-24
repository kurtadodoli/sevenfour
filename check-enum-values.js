const mysql = require('mysql2/promise');

async function checkDeliveryStatusEnum() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 's3v3n-f0ur-cl0thing*',
    database: 'seven_four_clothing'
  });

  try {
    // Check the exact enum values for delivery_status
    const [columns] = await connection.execute(`
      SELECT COLUMN_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'seven_four_clothing' 
      AND TABLE_NAME = 'custom_designs' 
      AND COLUMN_NAME = 'delivery_status'
    `);
    
    console.log('Delivery status enum values:', columns[0].COLUMN_TYPE);
    
    // Test if 'scheduled' is a valid value
    console.log('\nTesting delivery status values...');
    
    const testValues = ['pending', 'scheduled', 'in_transit', 'delivered', 'delayed'];
    
    for (const status of testValues) {
      try {
        // Try to update a record with this status value
        const [result] = await connection.execute(`
          UPDATE custom_designs 
          SET delivery_status = ? 
          WHERE design_id = 'DESIGN-TEST-1750689783778'
        `, [status]);
        
        console.log(`✅ Status '${status}': VALID`);
      } catch (error) {
        console.log(`❌ Status '${status}': INVALID - ${error.message}`);
      }
    }
    
    // Check current data
    console.log('\nCurrent custom designs with delivery status:');
    const [designs] = await connection.execute(`
      SELECT design_id, customer_name, status, delivery_status 
      FROM custom_designs 
      WHERE status = 'approved'
    `);
    
    designs.forEach(design => {
      console.log(`- ${design.design_id}: ${design.customer_name} (${design.delivery_status || 'null'})`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkDeliveryStatusEnum();
