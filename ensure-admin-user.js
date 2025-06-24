const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: process.env.DB_PASSWORD || 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing'
};

async function checkAndCreateAdmin() {
  let connection;
  
  try {
    console.log('🔄 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected');    // First, check if the admin user exists
    console.log('\n🔍 Checking for admin user: qka-adodoli@tip.edu.ph');
    const [users] = await connection.execute(
      'SELECT user_id, email, first_name, last_name, role, password FROM users WHERE email = ?',
      ['qka-adodoli@tip.edu.ph']
    );

    if (users.length === 0) {
      console.log('❌ Admin user not found. Creating admin user...');
      
      // Hash the password
      const hashedPassword = await bcrypt.hash('admin123', 10);
        // Create the admin user
      await connection.execute(
        'INSERT INTO users (email, password, first_name, last_name, role, phone, gender, birthday, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())',
        ['qka-adodoli@tip.edu.ph', hashedPassword, 'Admin', 'User', 'admin', '09123456789', 'other', '1990-01-01']
      );
      
      console.log('✅ Admin user created successfully');
      
      // Verify the creation
      const [newUsers] = await connection.execute(
        'SELECT user_id, email, first_name, last_name, role FROM users WHERE email = ?',
        ['qka-adodoli@tip.edu.ph']
      );
      
      if (newUsers.length > 0) {        const user = newUsers[0];
        console.log('✅ Admin user verified:');
        console.log(`   - ID: ${user.user_id}`);
        console.log(`   - Email: ${user.email}`);
        console.log(`   - Name: ${user.first_name} ${user.last_name}`);
        console.log(`   - Role: ${user.role}`);
      }
    } else {      const user = users[0];
      console.log('✅ Admin user found:');
      console.log(`   - ID: ${user.user_id}`);
      console.log(`   - Email: ${user.email}`);
      console.log(`   - Name: ${user.first_name} ${user.last_name}`);
      console.log(`   - Role: ${user.role}`);
      
      // Check if role is admin
      if (user.role !== 'admin') {
        console.log('🔄 Updating user role to admin...');
        await connection.execute(
          'UPDATE users SET role = ? WHERE email = ?',
          ['admin', 'qka-adodoli@tip.edu.ph']
        );
        console.log('✅ User role updated to admin');
      }
      
      // Test password verification
      console.log('\n🔐 Testing password...');
      const isPasswordValid = await bcrypt.compare('admin123', user.password);
      if (isPasswordValid) {
        console.log('✅ Password is correct');
      } else {
        console.log('❌ Password is incorrect. Updating password...');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await connection.execute(
          'UPDATE users SET password = ? WHERE email = ?',
          [hashedPassword, 'qka-adodoli@tip.edu.ph']
        );
        console.log('✅ Password updated successfully');
      }
    }

    // List all admin users
    console.log('\n📊 All admin users in the system:');    const [adminUsers] = await connection.execute(
      'SELECT user_id, email, first_name, last_name, role, created_at FROM users WHERE role = "admin"'
    );
    
    if (adminUsers.length === 0) {
      console.log('❌ No admin users found');
    } else {
      adminUsers.forEach((admin, index) => {
        console.log(`${index + 1}. ${admin.first_name} ${admin.last_name} (${admin.email}) - ID: ${admin.user_id}`);
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

checkAndCreateAdmin();
