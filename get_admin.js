const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function getAdminUser() {
    const conn = await mysql.createConnection(dbConfig);
    
    // Check for admin users
    const [users] = await conn.execute(`
        SELECT user_id, username, role FROM users 
        WHERE role = 'admin' OR role = 'staff'
        LIMIT 5
    `);
    
    console.log('Admin/Staff users:');
    users.forEach(user => {
        console.log(`ID: ${user.user_id}, Username: ${user.username}, Role: ${user.role}`);
    });
    
    if (users.length === 0) {
        // Check all users
        const [allUsers] = await conn.execute(`
            SELECT user_id, username, role FROM users LIMIT 5
        `);
        console.log('\nAll users:');
        allUsers.forEach(user => {
            console.log(`ID: ${user.user_id}, Username: ${user.username}, Role: ${user.role}`);
        });
    }
    
    await conn.end();
}

getAdminUser().catch(console.error);
