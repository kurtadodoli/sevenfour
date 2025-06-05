require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function checkUser() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        console.log('\n=== User Verification ===');

        // First delete existing test user
        await pool.query('DELETE FROM users WHERE email = ?', ['test@example.com']);
        console.log('✅ Cleaned up existing test user');

        // Create new test user
        const password = 'Test123!@#';
        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await pool.query(`
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

        console.log('✅ Created test user with ID:', result.insertId);
        console.log('Login credentials:');
        console.log('Email: test@example.com');
        console.log('Password: Test123!@#');

        // Verify the user
        const [users] = await pool.query(
            'SELECT * FROM users WHERE email = ?',
            ['test@example.com']
        );

        const user = users[0];
        console.log('\nVerifying password...');
        const isValid = await bcrypt.compare(password, user.password);
        
        console.log('Password verification:', isValid ? '✅ Valid' : '❌ Invalid');
        console.log('Stored hash:', user.password);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await pool.end();
    }
}

checkUser();