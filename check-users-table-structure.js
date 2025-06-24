const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: process.env.DB_PASSWORD || 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing'
};

async function checkUsersTable() {
  let connection;
  
  try {
    console.log('🔄 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected');

    // Check users table structure
    console.log('\n📋 Users table structure:');
    const [tableInfo] = await connection.execute('DESCRIBE users');
    tableInfo.forEach(column => {
      console.log(`  - ${column.Field}: ${column.Type} ${column.Null === 'YES' ? '(nullable)' : '(not null)'} ${column.Key ? `[${column.Key}]` : ''}`);
    });

    // Check for admin users
    console.log('\n📊 All users in the table:');
    const [users] = await connection.execute('SELECT * FROM users LIMIT 5');
    if (users.length === 0) {
      console.log('❌ No users found in table');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. Email: ${user.email}, Role: ${user.role || 'No role'}, Name: ${user.first_name || 'No name'}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n📝 Database connection closed');
    }
  }
}

checkUsersTable();
