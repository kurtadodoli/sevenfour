require('dotenv').config({ path: '../.env' });
const mysql = require('mysql2/promise');

async function verifyDatabase() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT
    });

    try {
        // Create database if not exists
        await pool.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
        await pool.execute(`USE ${process.env.DB_NAME}`);

        // Create users table if not exists
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS users (
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
                reset_token VARCHAR(255),
                reset_token_expires TIMESTAMP NULL,
                INDEX idx_email (email),
                INDEX idx_role (role)
            )
        `);

        // Create login_attempts table if not exists
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS login_attempts (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT,
                email VARCHAR(100) NOT NULL,
                ip_address VARCHAR(45),
                success BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
                INDEX idx_email (email),
                INDEX idx_created_at (created_at)
            )
        `);

        console.log('✅ Database and tables verified successfully');
    } catch (error) {
        console.error('❌ Error verifying database:', error);
    } finally {
        await pool.end();
    }
}

verifyDatabase();
