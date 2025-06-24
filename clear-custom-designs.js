const mysql = require('mysql2/promise');
require('dotenv').config({ path: './server/.env' });

async function clearCustomDesigns() {
  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('✅ Connected to database');

    // First, check how many records exist
    console.log('\n🔍 Checking current records...');
    const [countResult] = await connection.execute('SELECT COUNT(*) as total FROM custom_designs');
    const totalRecords = countResult[0].total;
    
    console.log(`📊 Found ${totalRecords} records in custom_designs table`);

    if (totalRecords === 0) {
      console.log('✅ Table is already empty - nothing to clear');
      return;
    }

    // Show a sample of what will be deleted
    console.log('\n📋 Sample records that will be deleted:');
    const [sampleRecords] = await connection.execute(
      'SELECT design_id, customer_name, customer_email, product_type, created_at FROM custom_designs LIMIT 5'
    );
    
    sampleRecords.forEach((record, index) => {
      console.log(`   ${index + 1}. ${record.design_id} - ${record.customer_name} (${record.customer_email}) - ${record.product_type}`);
    });

    if (totalRecords > 5) {
      console.log(`   ... and ${totalRecords - 5} more records`);
    }

    // Clear all records from custom_designs table
    console.log('\n🗑️  Clearing all records from custom_designs table...');
    const [deleteResult] = await connection.execute('DELETE FROM custom_designs');
    
    console.log(`✅ Successfully deleted ${deleteResult.affectedRows} records`);

    // Verify the table is empty
    console.log('\n✅ Verifying table is empty...');
    const [verifyResult] = await connection.execute('SELECT COUNT(*) as total FROM custom_designs');
    const remainingRecords = verifyResult[0].total;
    
    if (remainingRecords === 0) {
      console.log('✅ Table successfully cleared - 0 records remaining');
    } else {
      console.log(`⚠️  Warning: ${remainingRecords} records still remain`);
    }

    // Show table structure is intact
    console.log('\n📋 Verifying table structure is intact...');
    const [columns] = await connection.execute('DESCRIBE custom_designs');
    console.log(`✅ Table structure preserved - ${columns.length} columns intact`);
    
    console.log('\n🎉 Custom designs table cleared successfully!');
    console.log('💡 The table structure remains intact and ready for new records.');

  } catch (error) {
    console.error('❌ Error clearing custom designs:', error);
    console.error('Error details:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

console.log('🗑️  CLEARING CUSTOM DESIGNS TABLE');
console.log('==================================');
console.log('This will DELETE ALL RECORDS from custom_designs table');
console.log('(Table structure will be preserved)');
console.log('');

clearCustomDesigns();
