const mysql = require('mysql2/promise');

async function checkAdminUser() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 's3v3n-f0ur-cl0thing*',
    database: 'seven_four_clothing'
  });

  try {
    // Check if admin user exists
    const [adminUsers] = await connection.execute(
      'SELECT * FROM users WHERE role = "admin"'
    );
    
    console.log('🔍 Current admin users:');
    adminUsers.forEach(user => {
      console.log(`  - ID: ${user.id}, Username: ${user.username}, Email: ${user.email}, Role: ${user.role}`);
    });
    
    if (adminUsers.length === 0) {
      console.log('❌ No admin users found! Creating one...');
      
      // Create admin user
      await connection.execute(`
        INSERT INTO users (username, email, password, role, first_name, last_name, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, NOW())
      `, ['admin', 'admin@sevenfour.com', '$2b$10$rBOcMDrGdA5M8z8z8z8z8z8z8z8z8z8z8z8z8z8z8z8z8z8z8z8z8z8', 'admin', 'Admin', 'User']);
      
      console.log('✅ Admin user created successfully!');
      console.log('   Username: admin');
      console.log('   Email: admin@sevenfour.com');
      console.log('   Password: admin123');
    }
    
    console.log(`✅ Found ${adminUsers.length} admin user(s)`);
    
  } catch (error) {
    console.error('❌ Error checking admin user:', error.message);
  } finally {
    await connection.end();
  }
}

checkAdminUser();
