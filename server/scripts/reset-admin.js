const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function resetAdminUser() {
    try {
        // Create connection
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('Connected to database');

        // Hash admin password
        const hashedPassword = await bcrypt.hash('Admin@123', 10);

        // Check if admin exists
        const [existingAdmin] = await connection.execute(
            'SELECT * FROM users WHERE email = ?',
            ['admin@sevenfour.com']
        );

        if (existingAdmin.length > 0) {
            // Update existing admin
            await connection.execute(
                `UPDATE users 
                SET password = ?, role = 'admin', is_active = TRUE 
                WHERE email = ?`,
                [hashedPassword, 'admin@sevenfour.com']
            );
            console.log('Admin account updated successfully');
        } else {
            // Create new admin
            await connection.execute(
                `INSERT INTO users (
                    user_id, username, email, password, role, 
                    first_name, last_name, birthday, gender, is_active
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    'ADMIN000001',
                    'admin',
                    'admin@sevenfour.com',
                    hashedPassword,
                    'admin',
                    'Admin',
                    'User',
                    '2000-01-01',
                    'other',
                    true
                ]
            );
            console.log('Admin account created successfully');
        }

        await connection.end();
        console.log('Database connection closed');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

resetAdminUser();
