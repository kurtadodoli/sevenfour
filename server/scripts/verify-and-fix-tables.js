require('dotenv').config({ path: '../.env' });
const mysql = require('mysql2/promise');

async function verifyAndFixTables() {
    const pool = await mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        multipleStatements: true
    });

    try {
        // Create database if not exists
        await pool.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
        await pool.query(`USE ${process.env.DB_NAME}`);

        // Drop and recreate users table
        await pool.query(`
            DROP TABLE IF EXISTS users;
            
            CREATE TABLE users (
                id INT PRIMARY KEY AUTO_INCREMENT,
                first_name VARCHAR(50) NOT NULL,
                last_name VARCHAR(50) NOT NULL,
                email VARCHAR(100) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                gender ENUM('male', 'female', 'other') NOT NULL DEFAULT 'other',
                birthday DATE NOT NULL,
                role ENUM('customer', 'admin', 'staff') DEFAULT 'customer',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_email (email)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        console.log('✅ Database tables verified and fixed');

    } catch (error) {
        console.error('❌ Database error:', error);
    } finally {
        await pool.end();
    }
}

verifyAndFixTables();
