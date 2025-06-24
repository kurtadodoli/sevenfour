const mysql = require('mysql2/promise');
require('dotenv').config({ path: './server/.env' });

async function checkUsers() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('✅ Connected to database');
    console.log('\n📋 Checking existing users...');
    
    const [users] = await connection.execute(
      'SELECT user_id, email, first_name, last_name, role, is_active FROM users WHERE is_active = 1 LIMIT 10'
    );
    
    if (users.length === 0) {
      console.log('❌ No active users found');
    } else {
      console.log(`✅ Found ${users.length} active user(s):`);
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.first_name} ${user.last_name} (${user.email}) - ID: ${user.user_id} - Role: ${user.role}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

checkUsers();
