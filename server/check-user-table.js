const mysql = require('mysql2/promise');
const { dbConfig } = require('./config/db');

async function checkUserTable() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    console.log('📊 Checking users table structure...');
    const [userCols] = await connection.execute('DESCRIBE users');
    console.log('Users table columns:', userCols);
    
    console.log('📊 Checking carts table structure...');
    const [cartCols] = await connection.execute('DESCRIBE carts');
    console.log('Carts table columns:', cartCols);
    
    // Get a sample user to see the ID format
    const [users] = await connection.execute('SELECT id FROM users LIMIT 1');
    console.log('Sample user ID:', users);
    
    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkUserTable();
