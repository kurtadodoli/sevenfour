// Fix delivery table customer_id column type
const mysql = require('mysql2/promise');

async function fixDeliveryTableStructure() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 's3v3n-f0ur-cl0thing*',
      database: 'seven_four_clothing'
    });

    console.log('🔧 Fixing delivery_schedules_enhanced table customer_id column...');
    
    // Check current type
    const [columns] = await connection.execute('DESCRIBE delivery_schedules_enhanced');
    const customerIdColumn = columns.find(col => col.Field === 'customer_id');
    console.log('📋 Current customer_id column:', customerIdColumn);
    
    if (customerIdColumn && customerIdColumn.Type === 'int') {
      console.log('🔨 Altering customer_id column from int to bigint...');
      await connection.execute('ALTER TABLE delivery_schedules_enhanced MODIFY COLUMN customer_id BIGINT');
      console.log('✅ customer_id column altered successfully');
    } else {
      console.log('✅ customer_id column is already bigint or does not exist');
    }
    
    // Verify the change
    const [newColumns] = await connection.execute('DESCRIBE delivery_schedules_enhanced');
    const newCustomerIdColumn = newColumns.find(col => col.Field === 'customer_id');
    console.log('📋 Updated customer_id column:', newCustomerIdColumn);
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixDeliveryTableStructure().catch(console.error);
