const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const { dbConfig } = require('./server/config/db');

async function updateUserPassword() {
    console.log('=== UPDATING USER PASSWORD FOR TESTING ===');
    
    const connection = await mysql.createConnection(dbConfig);
    
    try {
        // Update the password for the test user
        const email = 'krutadodoli@gmail.com';
        const newPassword = 'test123';
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        await connection.execute(`
            UPDATE users SET password = ? WHERE email = ?
        `, [hashedPassword, email]);
        
        console.log(`✅ Password updated for ${email} to: ${newPassword}`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await connection.end();
    }
}

updateUserPassword();
