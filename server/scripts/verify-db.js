require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function verifyDatabase() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        console.log('\n=== Database Verification ===');
        
        // Test connection
        await pool.query('SELECT 1');
        console.log('✅ Database connected');

        // Delete existing test user
        await pool.query("DELETE FROM users WHERE email = 'test@example.com'");
        console.log('✅ Cleaned up existing test user');

        // Create test user with known credentials
        const password = 'Test123!@#';
        const hashedPassword = await bcrypt.hash(password, 10);

        const [insertResult] = await pool.query(`
            INSERT INTO users (
                username,
                email,
                password,
                first_name,
                last_name,
                birthday,
                gender,
                province_id,
                city_id,
                newsletter
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            'test_user',
            'test@example.com',
            hashedPassword,
            'Test',
            'User',
            '1990-01-01',
            'MALE',
            1,
            1,
            false
        ]);

        // Verify the user was created
        const [users] = await pool.query(
            'SELECT id, email, password FROM users WHERE email = ?',
            ['test@example.com']
        );

        console.log('\n✅ Test user created:', {
            id: users[0].id,
            email: users[0].email,
            passwordHash: users[0].password.substring(0, 20) + '...'
        });

        console.log('\nTest credentials:');
        console.log('Email: test@example.com');
        console.log('Password: Test123!@#');

    } catch (error) {
        console.error('❌ Database error:', error);
    } finally {
        await pool.end();
    }
}

verifyDatabase();