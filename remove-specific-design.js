const mysql = require('mysql2/promise');

async function removeSpecificCustomDesign() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 's3v3n-f0ur-cl0thing*',
    database: 'seven_four_clothing'
  });

  try {
    console.log('🎯 Removing Specific Custom Design Record...\n');
    
    const designId = 'DESIGN-TEST-1750689783778';
    
    // First, check if the record exists
    console.log('🔍 Searching for custom design...');
    const [existingRecords] = await connection.execute(
      'SELECT * FROM custom_designs WHERE design_id = ?',
      [designId]
    );
    
    if (existingRecords.length === 0) {
      console.log(`❌ Custom design ${designId} not found in database`);
      return;
    }
    
    console.log(`✅ Found custom design: ${designId}`);
    console.log('📋 Record details:');
    const record = existingRecords[0];
    console.log(`   - ID: ${record.id}`);
    console.log(`   - Design ID: ${record.design_id}`);
    console.log(`   - Customer: ${record.customer_name}`);
    console.log(`   - Email: ${record.customer_email}`);
    console.log(`   - Product: ${record.product_type}`);
    console.log(`   - Status: ${record.status}`);
    console.log(`   - Delivery Status: ${record.delivery_status || 'N/A'}`);
    console.log(`   - Created: ${record.created_at}`);
    
    // Delete the record
    console.log('\n🗑️ Deleting custom design record...');
    const [deleteResult] = await connection.execute(
      'DELETE FROM custom_designs WHERE design_id = ?',
      [designId]
    );
    
    if (deleteResult.affectedRows > 0) {
      console.log(`✅ Successfully deleted custom design ${designId}`);
      console.log(`   - ${deleteResult.affectedRows} record(s) removed`);
    } else {
      console.log(`❌ No records were deleted for ${designId}`);
    }
    
    // Verify deletion
    console.log('\n🔍 Verification:');
    const [verifyRecords] = await connection.execute(
      'SELECT COUNT(*) as count FROM custom_designs WHERE design_id = ?',
      [designId]
    );
    
    if (verifyRecords[0].count === 0) {
      console.log(`✅ Confirmed: ${designId} has been completely removed`);
    } else {
      console.log(`⚠️ Warning: ${verifyRecords[0].count} record(s) still exist`);
    }
    
    // Show remaining custom designs
    const [remainingDesigns] = await connection.execute(
      'SELECT design_id, customer_name, status FROM custom_designs ORDER BY created_at DESC LIMIT 5'
    );
    
    console.log('\n📋 Remaining custom designs:');
    if (remainingDesigns.length > 0) {
      remainingDesigns.forEach((design, index) => {
        console.log(`   ${index + 1}. ${design.design_id} - ${design.customer_name} (${design.status})`);
      });
    } else {
      console.log('   No custom designs remaining in database');
    }
    
  } catch (error) {
    console.error('❌ Error removing custom design:', error.message);
  } finally {
    await connection.end();
  }
}

removeSpecificCustomDesign();
