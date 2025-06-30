const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing'
};

async function testConnection() {
  let connection;
  
  try {
    console.log('🔌 Attempting to connect to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database successfully');

    console.log('📋 Checking custom_orders table...');
    const [columns] = await connection.execute(`SHOW COLUMNS FROM custom_orders`);
    
    console.log(`Found ${columns.length} columns in custom_orders table:`);
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type}`);
    });

    // Check for delivery_status specifically
    const hasDeliveryStatus = columns.some(col => col.Field === 'delivery_status');
    console.log(`\n🔍 delivery_status column exists: ${hasDeliveryStatus}`);

    if (!hasDeliveryStatus) {
      console.log('\n⚠️ FOUND THE ISSUE: delivery_status column is missing!');
      console.log('🔧 Adding delivery_status column...');
      
      await connection.execute(`
        ALTER TABLE custom_orders 
        ADD COLUMN delivery_status ENUM('pending', 'scheduled', 'in_transit', 'delivered', 'delayed', 'cancelled') DEFAULT 'pending'
      `);
      
      console.log('✅ Added delivery_status column successfully');
      
      // Verify it was added
      const [newColumns] = await connection.execute(`SHOW COLUMNS FROM custom_orders WHERE Field = 'delivery_status'`);
      if (newColumns.length > 0) {
        console.log(`✅ Verified: delivery_status column now exists with type: ${newColumns[0].Type}`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ER_NO_SUCH_TABLE') {
      console.error('❌ The custom_orders table does not exist!');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('❌ Database access denied - check credentials');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('❌ Database connection refused - is MySQL running?');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

testConnection();
