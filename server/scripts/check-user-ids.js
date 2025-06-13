const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkUserIds() {  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'seven_four_clothing'
  });

  try {
    const [users] = await pool.execute('SELECT user_id, email FROM users LIMIT 5');
    console.log('Current user IDs:');
    users.forEach(user => console.log(`ID: ${user.user_id}, Email: ${user.email}`));
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkUserIds();
