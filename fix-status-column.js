const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: process.env.DB_PASSWORD || 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing'
};

async function fixCustomOrdersStatusColumn() {
  let connection;
  
  try {
    console.log('🔄 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected');

    // Check current status column structure
    console.log('\n📋 Checking current custom_orders table structure...');
    const [tableInfo] = await connection.execute('DESCRIBE custom_orders');
    const statusColumn = tableInfo.find(col => col.Field === 'status');
    
    if (statusColumn) {
      console.log(`📊 Current status column: ${statusColumn.Type}`);
    } else {
      console.log('❌ Status column not found!');
      return;
    }

    // Check current status values
    console.log('\n📊 Current status values in database:');
    const [statusValues] = await connection.execute('SELECT DISTINCT status FROM custom_orders');
    statusValues.forEach((row, index) => {
      console.log(`${index + 1}. "${row.status}"`);
    });

    // Update the status column to accommodate longer values
    console.log('\n🔧 Updating status column to support longer values...');
    await connection.execute(`
      ALTER TABLE custom_orders 
      MODIFY COLUMN status ENUM('pending', 'approved', 'rejected', 'completed', 'cancelled') 
      DEFAULT 'pending'
    `);
    
    console.log('✅ Status column updated successfully');

    // Verify the change
    console.log('\n📋 Verifying updated table structure...');
    const [newTableInfo] = await connection.execute('DESCRIBE custom_orders');
    const newStatusColumn = newTableInfo.find(col => col.Field === 'status');
    console.log(`✅ New status column: ${newStatusColumn.Type}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n📝 Database connection closed');
    }
  }
}

fixCustomOrdersStatusColumn();
