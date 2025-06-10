require('dotenv').config({ path: '../.env' });
const mysql = require('mysql2/promise');

async function verifyTables() {
    const pool = await mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    try {
        // Verify users table
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
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        // Verify login_attempts table
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS login_attempts (
                id INT PRIMARY KEY AUTO_INCREMENT,
                email VARCHAR(100) NOT NULL,
                ip_address VARCHAR(45) NOT NULL,
                user_agent VARCHAR(255),
                success BOOLEAN NOT NULL DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_email_ip (email, ip_address)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        console.log('✅ Database tables verified successfully');

        // Check if admin user exists
        const [adminUsers] = await pool.execute(
            'SELECT id FROM users WHERE email = ? AND role = ?',
            ['admin@sevenfour.com', 'admin']
        );

        if (adminUsers.length === 0) {
            const hashedPassword = await require('bcryptjs').hash('Admin@123', 10);
            await pool.execute(
                'INSERT INTO users (first_name, last_name, email, password, gender, birthday, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
                ['Admin', 'User', 'admin@sevenfour.com', hashedPassword, 'other', '1990-01-01', 'admin']
            );
            console.log('✅ Admin user created successfully');
        }

    } catch (error) {
        console.error('❌ Error verifying database:', error);
    } finally {
        await pool.end();
    }
}

verifyTables();
