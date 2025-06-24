const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function checkUsers() {
    console.log('👥 Checking users in database...');
    
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        const [users] = await connection.execute(`
            SELECT user_id, first_name, last_name, email, role
            FROM users 
            ORDER BY created_at DESC
            LIMIT 10
        `);
        
        console.log(`📋 Found ${users.length} users:`);
        users.forEach((user, index) => {
            console.log(`  ${index + 1}. ${user.first_name} ${user.last_name} (${user.email}) - ${user.role}`);
        });
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

checkUsers();
