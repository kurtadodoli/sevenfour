const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function checkUserTableStructure() {
    console.log('=== CHECKING USER TABLE STRUCTURE ===');
    
    const connection = await mysql.createConnection(dbConfig);
    
    try {
        // Check table structure
        const [columns] = await connection.execute(`
            DESCRIBE users
        `);
        
        console.log('\n📋 Users table structure:');
        columns.forEach((col, index) => {
            console.log(`${index + 1}. ${col.Field} (${col.Type}) - ${col.Null === 'YES' ? 'Nullable' : 'Not Null'} - ${col.Key} - Default: ${col.Default}`);
        });
        
        // Check all users with correct column names
        const [users] = await connection.execute(`
            SELECT * FROM users LIMIT 5
        `);
        
        console.log(`\n📋 Found ${users.length} users:`);
        users.forEach((user, index) => {
            console.log(`${index + 1}. User:`, user);
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await connection.end();
    }
}

checkUserTableStructure();
