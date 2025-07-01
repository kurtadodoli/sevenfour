const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Ana080803!',
  database: 'seven_four_clothing',
  port: 3306
};

async function checkUsers() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('📋 Checking users in database...');
    
    const [users] = await connection.execute(`
      SELECT user_id, first_name, last_name, email, role, is_admin 
      FROM users 
      ORDER BY user_id
    `);
    
    console.log(`📊 Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`  ID: ${user.user_id} | ${user.first_name} ${user.last_name} | ${user.email} | Role: ${user.role} | Admin: ${user.is_admin ? 'Yes' : 'No'}`);
    });
    
    const admins = users.filter(u => u.is_admin || u.role === 'admin');
    console.log(`\n👑 Admin users (${admins.length}):`);
    admins.forEach(admin => {
      console.log(`  ${admin.email} - ${admin.first_name} ${admin.last_name}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

checkUsers();
