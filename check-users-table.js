const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function checkUsers() {
    console.log('=== CHECKING USERS IN DATABASE ===');
    
    const connection = await mysql.createConnection(dbConfig);
    
    try {
        // Check all users
        const [users] = await connection.execute(`
            SELECT user_id, email, username, role, created_at 
            FROM users 
            ORDER BY created_at DESC
        `);
        
        console.log(`\n📋 Found ${users.length} users:`);
        users.forEach((user, index) => {
            console.log(`${index + 1}. ID: ${user.user_id}, Email: ${user.email}, Username: ${user.username}, Role: ${user.role}`);
        });
        
        // Check the specific user from custom order
        const [specificUser] = await connection.execute(`
            SELECT user_id, email, username, role, password_hash 
            FROM users 
            WHERE email = ?
        `, ['krutadodoli@gmail.com']);
        
        if (specificUser.length > 0) {
            console.log('\n🔍 Found user with email krutadodoli@gmail.com:');
            console.log('User ID:', specificUser[0].user_id);
            console.log('Email:', specificUser[0].email);
            console.log('Username:', specificUser[0].username);
            console.log('Role:', specificUser[0].role);
            console.log('Has password hash:', !!specificUser[0].password_hash);
        } else {
            console.log('\n❌ User with email krutadodoli@gmail.com not found');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await connection.end();
    }
}

checkUsers();
