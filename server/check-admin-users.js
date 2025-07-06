const mysql = require('mysql2/promise');
const { dbConfig } = require('./config/db');

async function checkAdminUsers() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        
        console.log('Checking for admin users in the database...\n');
        
        // Check users table structure
        const [tableInfo] = await connection.execute('DESCRIBE users');
        console.log('Users table structure:');
        tableInfo.forEach(row => {
            console.log(`  - ${row.Field}: ${row.Type} ${row.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${row.Key} ${row.Default !== null ? `DEFAULT ${row.Default}` : ''} ${row.Extra}`);
        });
        
        console.log('\n' + '='.repeat(50) + '\n');
        
        // Check all users and their roles
        const [users] = await connection.execute('SELECT user_id, email, first_name, last_name, role, is_active FROM users');
        
        console.log('All users in database:');
        if (users.length === 0) {
            console.log('  No users found!');
        } else {
            users.forEach(user => {
                console.log(`  - ID: ${user.user_id}`);
                console.log(`    Email: ${user.email}`);
                console.log(`    Name: ${user.first_name} ${user.last_name}`);
                console.log(`    Role: ${user.role}`);
                console.log(`    Active: ${user.is_active}`);
                console.log('    ---');
            });
        }
        
        console.log('\n' + '='.repeat(50) + '\n');
        
        // Check for admin users specifically
        const [adminUsers] = await connection.execute('SELECT user_id, email, first_name, last_name, role, is_active FROM users WHERE role = ?', ['admin']);
        
        console.log('Admin users:');
        if (adminUsers.length === 0) {
            console.log('  No admin users found!');
            console.log('  You need to create an admin user to access the TransactionPage.');
        } else {
            adminUsers.forEach(admin => {
                console.log(`  - ID: ${admin.user_id}`);
                console.log(`    Email: ${admin.email}`);
                console.log(`    Name: ${admin.first_name} ${admin.last_name}`);
                console.log(`    Active: ${admin.is_active}`);
                console.log('    ---');
            });
        }
        
    } catch (error) {
        console.error('Error checking admin users:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

checkAdminUsers().then(() => {
    console.log('\nAdmin user check completed');
    process.exit(0);
}).catch(error => {
    console.error('Script error:', error);
    process.exit(1);
});
