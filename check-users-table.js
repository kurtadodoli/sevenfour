const mysql = require('mysql2/promise');

async function checkUsersTable() {
    console.log('🔍 Checking users table structure...\n');
    
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 's3v3n-f0ur-cl0thing*',
        database: 'seven_four_clothing'
    });
    
    try {
        // Check table structure
        const [structure] = await connection.execute('DESCRIBE users');
        console.log('Users table structure:');
        console.table(structure);
        
        // Check all users with correct column names
        const [users] = await connection.execute('SELECT * FROM users LIMIT 5');
        console.log('\nUsers in database:');
        console.table(users);
        
    } catch (error) {
        console.error('Error checking users table:', error.message);
    } finally {
        await connection.end();
    }
}

checkUsersTable();
