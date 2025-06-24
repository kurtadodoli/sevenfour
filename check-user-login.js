const mysql = require('mysql2/promise');

async function checkUsers() {
    console.log('🔍 Checking users in database...\n');
      const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 's3v3n-f0ur-cl0thing*',
        database: 'seven_four_clothing'
    });
    
    try {
        // Check all users
        const [users] = await connection.execute('SELECT id, email, first_name, last_name, created_at FROM users ORDER BY created_at DESC');
        
        console.log('All users in database:');
        console.table(users);
        
        // Check if our test user exists
        const [testUser] = await connection.execute(
            'SELECT id, email, first_name, last_name, password FROM users WHERE email = ?',
            ['kurtadodoli@gmail.com']
        );
        
        console.log('\nTest user details:');
        if (testUser.length > 0) {
            console.log('✅ Test user found:');
            console.log({
                id: testUser[0].id,
                email: testUser[0].email,
                first_name: testUser[0].first_name,
                last_name: testUser[0].last_name,
                hasPassword: !!testUser[0].password
            });
        } else {
            console.log('❌ Test user not found');
        }
        
    } catch (error) {
        console.error('Error checking users:', error.message);
    } finally {
        await connection.end();
    }
}

checkUsers();
