const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function createTestUsers() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        // Create test@example.com user
        const password = 'Test123!@#';
        const hashedPassword = await bcrypt.hash(password, 10);

        // First, delete if exists
        await pool.query("DELETE FROM users WHERE email = 'test@example.com'");

        // Insert new test user
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

        console.log('Test user created successfully:', {
            id: result.insertId,
            email: 'test@example.com',
            password: 'Test123!@#'
        });

    } catch (error) {
        console.error('Error creating test user:', error);
    } finally {
        await pool.end();
    }
}

createTestUsers();