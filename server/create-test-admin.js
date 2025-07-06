const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const { dbConfig } = require('./config/db');

async function createTestAdmin() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        
        console.log('Creating test admin user...\n');
        
        // Check if test admin already exists
        const [existing] = await connection.execute('SELECT user_id FROM users WHERE email = ?', ['test@admin.com']);
        
        if (existing.length > 0) {
            console.log('Test admin already exists, updating password...');
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await connection.execute('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, 'test@admin.com']);
            console.log('✅ Updated existing test admin password to: admin123');
        } else {
            console.log('Creating new test admin...');
            const hashedPassword = await bcrypt.hash('admin123', 10);
            
            await connection.execute(`
                INSERT INTO users (first_name, last_name, email, password, gender, birthday, role, is_active)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, ['Test', 'Admin', 'test@admin.com', hashedPassword, 'other', '1990-01-01', 'admin', 1]);
            
            console.log('✅ Created new test admin user');
        }
        
        console.log('\n📋 Test Admin Credentials:');
        console.log('  Email: test@admin.com');
        console.log('  Password: admin123');
        console.log('  Role: admin');
        
    } catch (error) {
        console.error('Error creating test admin:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

createTestAdmin().then(() => {
    console.log('\nTest admin setup completed');
    process.exit(0);
}).catch(error => {
    console.error('Script error:', error);
    process.exit(1);
});
