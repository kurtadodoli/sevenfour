// Test database connection specifically
const mysql = require('mysql2/promise');

async function testDatabaseConnection() {
  try {
    console.log('🔍 Testing database connection...');
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'AdamEve2024!',
      database: 'seven_four_clothing'
    });
    
    console.log('✅ Database connected successfully');
    
    // Test the orders table specifically
    const [result] = await connection.execute('SELECT COUNT(*) as count FROM orders');
    console.log(`📊 Orders table has ${result[0].count} records`);
    
    // Test the customer_fullname column
    const [columns] = await connection.execute('DESCRIBE orders');
    const customerFullnameCol = columns.find(col => col.Field === 'customer_fullname');
    
    if (customerFullnameCol) {
      console.log('✅ customer_fullname column exists');
      console.log('   Type:', customerFullnameCol.Type);
      console.log('   Default:', customerFullnameCol.Default);
    } else {
      console.log('❌ customer_fullname column NOT found');
    }
    
    await connection.end();
    console.log('✅ Database test completed successfully');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Error code:', error.code);
  }
}

testDatabaseConnection();
