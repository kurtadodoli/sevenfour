const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

const initDatabase = async () => {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || ''
        });

        // Create database if it doesn't exist
        await connection.query('CREATE DATABASE IF NOT EXISTS seven_four_clothing');
        await connection.query('USE seven_four_clothing');        // Drop existing users table if it exists
        await connection.query('DROP TABLE IF EXISTS users');
          // Create users table with numeric ID
        await connection.query(`
            CREATE TABLE users (
                user_id BIGINT PRIMARY KEY,
                first_name VARCHAR(50) NOT NULL,
                last_name VARCHAR(50) NOT NULL,
                email VARCHAR(100) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                gender ENUM('male', 'female', 'other') NOT NULL,
                birthday DATE NOT NULL,
                role ENUM('admin', 'user') DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                last_login TIMESTAMP NULL,
                is_active BOOLEAN DEFAULT TRUE,
                INDEX idx_email (email)
            )
        `);

        // Create admin account if it doesn't exist
        const adminPassword = await bcrypt.hash('Admin@123', 10);
        await connection.query(`            INSERT IGNORE INTO users (
                user_id, first_name, last_name, email, password, 
                gender, birthday, role
            ) VALUES (
                10000001,
                'Admin',
                'User',
                'admin@sevenfour.com',
                ?,
                'other',
                '2000-01-01',
                'admin'
            )
        `, [adminPassword]);

        console.log('Database initialization completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Database initialization failed:', error);
        process.exit(1);
    }
};

initDatabase();
