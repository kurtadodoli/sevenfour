require('dotenv').config({ path: '../.env' });
const mysql = require('mysql2/promise');

async function setupDatabase() {
    const pool = await mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        multipleStatements: true
    });

    try {
        // Create database if it doesn't exist
        await pool.query(`
            CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME};
            USE ${process.env.DB_NAME};
        `);

        // Drop and recreate users table
        await pool.query(`
            DROP TABLE IF EXISTS login_attempts;
            DROP TABLE IF EXISTS users;

            CREATE TABLE users (
                id INT PRIMARY KEY AUTO_INCREMENT,
                first_name VARCHAR(50) NOT NULL,
                last_name VARCHAR(50) NOT NULL,
                email VARCHAR(100) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                gender ENUM('male', 'female', 'other') NOT NULL,
                birthday DATE NOT NULL,
                role ENUM('customer', 'admin', 'staff') DEFAULT 'customer',
                profile_picture_url VARCHAR(255),
                street_address VARCHAR(255),
                apartment_suite VARCHAR(50),
                city VARCHAR(100),
                state_province VARCHAR(100),
                postal_code VARCHAR(20),
                country VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                last_login TIMESTAMP NULL,
                INDEX idx_email (email),
                INDEX idx_role (role)
            );

            CREATE TABLE login_attempts (
                id INT PRIMARY KEY AUTO_INCREMENT,
                email VARCHAR(100) NOT NULL,
                ip_address VARCHAR(45),
                success BOOLEAN DEFAULT false,
                attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_email (email),
                INDEX idx_attempt_time (attempt_time)
            );
        `);

        console.log('✅ Database setup completed successfully');
        
    } catch (error) {
        console.error('❌ Database setup error:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

setupDatabase().catch(console.error);
