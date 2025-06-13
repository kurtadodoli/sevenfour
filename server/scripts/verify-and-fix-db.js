const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 's3v3n-f0ur-cl0thing*',
    database: process.env.DB_NAME || 'seven_four_clothing'
};

async function main() {
    const connection = await mysql.createConnection(dbConfig);
    
    try {
        console.log('Connected to database');
        
        // Check if users table exists
        const [tables] = await connection.execute(
            `SELECT TABLE_NAME 
             FROM information_schema.TABLES 
             WHERE TABLE_SCHEMA = ? 
             AND TABLE_NAME = 'users'`,
            [dbConfig.database]
        );

        if (tables.length === 0) {
            console.log('Users table does not exist, creating it...');
            await connection.execute(`
                CREATE TABLE IF NOT EXISTS users (
                    user_id VARCHAR(16) PRIMARY KEY,
                    email VARCHAR(100) NOT NULL UNIQUE,
                    password VARCHAR(255) NOT NULL,
                    role ENUM('admin', 'staff', 'customer') DEFAULT 'customer',
                    first_name VARCHAR(50) NOT NULL,
                    last_name VARCHAR(50) NOT NULL,
                    birthday DATE NOT NULL,
                    gender ENUM('male', 'female', 'other') NOT NULL,
                    province VARCHAR(100),
                    city VARCHAR(100),
                    newsletter BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    last_login TIMESTAMP NULL,
                    is_active BOOLEAN DEFAULT TRUE,
                    INDEX idx_email (email)
                )
            `);
        }

        // Check if admin user exists
        const [adminUser] = await connection.execute(
            'SELECT * FROM users WHERE email = ?',
            ['admin@sevenfour.com']
        );

        if (adminUser.length === 0) {
            console.log('Admin user does not exist, creating it...');
            const hashedPassword = await bcrypt.hash('Admin@123', 10);
            await connection.execute(`
                INSERT INTO users (
                    user_id,
                    email,
                    password,
                    role,
                    first_name,
                    last_name,
                    birthday,
                    gender,
                    is_active
                ) VALUES (
                    'ADMIN000001',
                    'admin@sevenfour.com',
                    ?,
                    'admin',
                    'Admin',
                    'User',
                    '2000-01-01',
                    'other',
                    TRUE
                )
            `, [hashedPassword]);
            console.log('Admin user created successfully');
        } else {
            console.log('Admin user exists');
        }

        // Check if login_attempts table exists
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS login_attempts (
                attempt_id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(100) NOT NULL,
                ip_address VARCHAR(45) NOT NULL,
                user_agent TEXT,
                success BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_email (email),
                INDEX idx_ip (ip_address)
            )
        `);

        console.log('Database verification complete');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await connection.end();
    }
}

main();
