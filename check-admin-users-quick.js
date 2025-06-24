const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function checkAdminUsers() {
    console.log('🔍 Checking Admin Users in Database');
    console.log('===================================');

    try {
        const connection = await mysql.createConnection(dbConfig);

        console.log('📊 Querying users table for admin accounts...');
        const [users] = await connection.execute(`
            SELECT user_id, email, role, first_name, last_name, created_at 
            FROM users 
            WHERE role = 'admin'
            ORDER BY created_at DESC
        `);

        if (users.length === 0) {
            console.log('❌ No admin users found');
        } else {
            console.log(`✅ Found ${users.length} admin user(s):`);
            users.forEach((user, index) => {
                console.log(`   ${index + 1}. ${user.email} (ID: ${user.user_id}, Name: ${user.first_name} ${user.last_name})`);
            });
        }

        // Also check for any users to test deletion
        console.log('\n📊 Querying for non-admin users for testing...');
        const [regularUsers] = await connection.execute(`
            SELECT user_id, email, role, first_name, last_name, created_at 
            FROM users 
            WHERE role != 'admin'
            ORDER BY created_at DESC
            LIMIT 5
        `);

        if (regularUsers.length === 0) {
            console.log('❌ No regular users found for testing');
        } else {
            console.log(`✅ Found ${regularUsers.length} regular user(s) for testing:`);
            regularUsers.forEach((user, index) => {
                console.log(`   ${index + 1}. ${user.email} (ID: ${user.user_id}, Name: ${user.first_name} ${user.last_name})`);
            });
        }

        await connection.end();

    } catch (error) {
        console.error('❌ Error checking admin users:', error.message);
    }
}

checkAdminUsers().catch(console.error);
