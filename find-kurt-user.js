const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function findKurtUser() {
    console.log('🔍 Looking for Kurt user...');
    
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        // Look for users with the specific ID and email from orders
        const [users] = await connection.execute(`
            SELECT user_id, first_name, last_name, email, role, created_at
            FROM users 
            WHERE user_id = ? OR email = ?
        `, [229491642395434, 'kurtadodoli@gmail.com']);
        
        console.log(`📋 Found ${users.length} matching users:`);
        users.forEach((user, index) => {
            console.log(`  ${index + 1}. ID: ${user.user_id}, Name: ${user.first_name} ${user.last_name}, Email: ${user.email}, Role: ${user.role}`);
        });
        
        // Also search for any user containing 'kurt'
        const [kurtUsers] = await connection.execute(`
            SELECT user_id, first_name, last_name, email, role, created_at
            FROM users 
            WHERE first_name LIKE '%kurt%' OR last_name LIKE '%kurt%' OR email LIKE '%kurt%'
        `);
        
        console.log(`\n📋 Users containing 'kurt': ${kurtUsers.length}`);
        kurtUsers.forEach((user, index) => {
            console.log(`  ${index + 1}. ID: ${user.user_id}, Name: ${user.first_name} ${user.last_name}, Email: ${user.email}, Role: ${user.role}`);
        });
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

findKurtUser();
