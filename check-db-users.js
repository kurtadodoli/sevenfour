// Check database users and test authentication
const mysql = require('mysql2/promise');

async function checkDatabaseUsers() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 's3v3n-f0ur-cl0thing*',
      database: 'seven_four_clothing'
    });

    console.log('📊 Checking database users...');
    
    // Get all users
    const [users] = await connection.execute(`
      SELECT user_id, email, role, is_active, created_at 
      FROM users 
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    
    console.log(`\n👥 Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`  - ${user.email} (ID: ${user.user_id}, Role: ${user.role}, Active: ${user.is_active})`);
    });

    // Check if there's an admin user
    const [admins] = await connection.execute(`
      SELECT user_id, email, role, is_active
      FROM users 
      WHERE role = 'admin' AND is_active = 1
    `);
    
    console.log(`\n👑 Found ${admins.length} active admin users:`);
    admins.forEach(admin => {
      console.log(`  - ${admin.email} (ID: ${admin.user_id})`);
    });

    await connection.end();
    
    // If no admin users, suggest creating one
    if (admins.length === 0) {
      console.log('\n⚠️ No active admin users found!');
      console.log('💡 Suggestion: Create an admin user or activate an existing user');
    } else {
      console.log('\n💡 Try logging in with one of the admin emails above');
      console.log('🔑 If you don\'t know the password, you may need to reset it');
    }

  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  }
}

checkDatabaseUsers();
