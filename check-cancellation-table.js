const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing'
};

async function checkCancellationTable() {
  try {
    console.log('🔍 Checking cancellation_requests table...');
    const connection = await mysql.createConnection(dbConfig);
    
    // Check if table exists
    const [tables] = await connection.execute("SHOW TABLES LIKE 'cancellation_requests'");
    console.log('Table exists:', tables.length > 0);
    
    if (tables.length > 0) {
      // Check table structure
      console.log('\n📋 Table structure:');
      const [columns] = await connection.execute('DESCRIBE cancellation_requests');
      console.table(columns);
      
      // Check existing data
      console.log('\n📊 Existing records:');
      const [records] = await connection.execute('SELECT COUNT(*) as count FROM cancellation_requests');
      console.log('Total records:', records[0].count);
    } else {
      console.log('❌ cancellation_requests table does not exist');
      
      // Check what tables do exist
      console.log('\n📋 Available tables:');
      const [allTables] = await connection.execute('SHOW TABLES');
      console.table(allTables);
    }
    
    await connection.end();
  } catch (error) {
    console.error('❌ Database check error:', error.message);
    console.error('Error details:', error);
  }
}

checkCancellationTable();
