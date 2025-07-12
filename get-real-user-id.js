const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing'
};

async function getRealUserId() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Get an existing user ID for testing
    const [users] = await connection.execute(`
      SELECT user_id, email, role
      FROM users 
      WHERE role IN ('admin', 'staff')
      LIMIT 1
    `);
    
    if (users.length > 0) {
      console.log('✅ Found admin user:', users[0]);
      return users[0].user_id;
    } else {
      console.log('❌ No admin users found, getting any user...');
      const [anyUsers] = await connection.execute(`
        SELECT user_id, email, role
        FROM users 
        LIMIT 1
      `);
      
      if (anyUsers.length > 0) {
        console.log('✅ Found user:', anyUsers[0]);
        return anyUsers[0].user_id;
      }
    }
    
    await connection.end();
    return null;
    
  } catch (error) {
    console.error('Error getting user ID:', error.message);
    return null;
  }
}

getRealUserId().then(userId => {
  console.log('User ID to use:', userId);
});
