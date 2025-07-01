const mysql = require('mysql2/promise');

async function checkAdminUsers() {
  let connection;
  try {
    const dbConfig = {
      host: 'localhost',
      user: 'root',
      password: 's3v3n-f0ur-cl0thing*',
      database: 'seven_four_clothing'
    };
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');
    
    // Check admin users
    const [admins] = await connection.execute(`
      SELECT user_id, first_name, last_name, email, role, password_hash 
      FROM users 
      WHERE role = 'admin'
    `);
    
    console.log(`📊 Found ${admins.length} admin users:`);
    admins.forEach((admin, index) => {
      console.log(`  ${index + 1}. ID: ${admin.user_id}, Name: ${admin.first_name} ${admin.last_name}, Email: ${admin.email}, Hash: ${admin.password_hash ? 'SET' : 'NOT SET'}`);
    });
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

checkAdminUsers();
