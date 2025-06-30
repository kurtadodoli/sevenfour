// Check users table structure
const mysql = require('mysql2/promise');

async function checkUsersTable() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 's3v3n-f0ur-cl0thing*',
      database: 'seven_four_clothing'
    });

    console.log('📊 Checking users table structure...');
    
    // Get table structure
    const [columns] = await connection.execute('DESCRIBE users');
    console.log('👥 Users table columns:');
    columns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });
    
    // Get sample users
    const [users] = await connection.execute('SELECT * FROM users LIMIT 3');
    console.log('\n📋 Sample users:');
    users.forEach((user, index) => {
      console.log(`  User ${index + 1}:`, Object.keys(user).reduce((obj, key) => {
        obj[key] = user[key];
        return obj;
      }, {}));
    });
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkUsersTable().catch(console.error);
