require('dotenv').config();
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

async function testAuth() {
    // Create database connection
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        // Delete any existing test user
        await pool.query('DELETE FROM users WHERE email = ?', ['test@example.com']);
        
        // Create a test user with known password
        const password = 'Test123!@#';
        const hashedPassword = await bcrypt.hash(password, 10);
          await pool.query(`
            INSERT INTO users (
                email, password, first_name, last_name, 
                birthday, gender, role
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            'test@example.com',
            hashedPassword,
            'Test',
            'User',
            '1990-01-01',
            'MALE',
            'customer'
        ]);

        // Verify the user exists
        const [users] = await pool.query(
            'SELECT id, email, password FROM users WHERE email = ?',
            ['test@example.com']
        );

        console.log('Test user created:', {
            email: users[0].email,
            passwordHash: users[0].password.substring(0, 20) + '...'
        });

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await pool.end();
    }
}

testAuth();