// Check what users exist in the system
const mysql = require('mysql2/promise');

require('dotenv').config({ path: './server/.env' });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'seven_four_clothing'
};

async function checkUsers() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    
    const [users] = await connection.execute('SELECT user_id, email, role, is_active FROM users LIMIT 5');
    console.log('📋 Users in system:');
    users.forEach(user => {
      console.log(`   ${user.email} (${user.role}) - Active: ${user.is_active}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

checkUsers();
