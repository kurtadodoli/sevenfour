const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 's3v3n-f0ur-cl0thing*',
    database: 'seven_four_clothing'
};

async function getAdminUsers() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        const [admins] = await connection.execute(`
            SELECT user_id, first_name, last_name, email, role, password 
            FROM users 
            WHERE role = 'admin' OR role = 'staff'
            ORDER BY role, user_id
            LIMIT 10
        `);
        
        console.log('Admin users found:', admins.length);
        admins.forEach((admin, index) => {
            console.log(`${index + 1}. ${admin.email} (${admin.role}) - ${admin.first_name} ${admin.last_name}`);
            console.log(`   User ID: ${admin.user_id}, Password hash: ${admin.password ? 'SET' : 'NOT SET'}`);
        });
        
        await connection.end();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

getAdminUsers();
