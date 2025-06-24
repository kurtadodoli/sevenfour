const mysql = require('mysql2/promise');

async function checkAdmin() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 's3v3n-f0ur-cl0thing*',
    database: 'seven_four_clothing'
  });
  
  const [admins] = await connection.execute('SELECT user_id, email, role, is_active FROM users WHERE role = "admin"');
  console.log('Admin users:', admins);
  
  if (admins.length === 0) {
    console.log('No admin users found. Checking all users...');
    const [allUsers] = await connection.execute('SELECT user_id, email, role, is_active FROM users LIMIT 5');
    console.log('Sample users:', allUsers);
  }
  
  await connection.end();
}

checkAdmin().catch(console.error);
