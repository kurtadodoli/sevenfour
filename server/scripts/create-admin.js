const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function createAdminUser() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        // Delete existing admin if exists
        await pool.execute("DELETE FROM users WHERE email = 'admin@sevenfour.com'");

        // Create new admin user with password 'Admin@123'
        const password = 'Admin@123';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await pool.execute(
            `INSERT INTO users (
                first_name,
                last_name,
                email,
                password,
                gender,
                birthday,
                role
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                'Admin',
                'User',
                'admin@sevenfour.com',
                hashedPassword,
                'other',
                '1990-01-01',
                'admin'
            ]
        );

        console.log('Admin user created successfully');
        console.log('Email: admin@sevenfour.com');
        console.log('Password: Admin@123');
        
    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        await pool.end();
    }
}

createAdminUser();
