const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDatabase() {
    try {
        // Create connection
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        });

        console.log('Connected to MySQL server...');

        // Create database
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
        await connection.query(`USE ${process.env.DB_NAME}`);

        // Create users table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                email VARCHAR(100) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                role ENUM('customer', 'admin', 'staff') NOT NULL DEFAULT 'customer',
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                birthday DATE NOT NULL DEFAULT '2000-01-01',
                gender ENUM('MALE', 'FEMALE', 'PREFER_NOT_TO_SAY') NOT NULL DEFAULT 'PREFER_NOT_TO_SAY',
                province VARCHAR(100) NOT NULL DEFAULT 'Metro Manila',
                city VARCHAR(100) NOT NULL DEFAULT 'Makati',
                newsletter TINYINT(1) NOT NULL DEFAULT 0,
                is_active TINYINT(1) NOT NULL DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Create provinces table
        await connection.query(`
            CREATE TABLE provinces (
                province_id INT AUTO_INCREMENT PRIMARY KEY,
                province_name VARCHAR(100) NOT NULL UNIQUE
            )
        `);

        // Insert provinces with explicit IDs
        await connection.query(`
            INSERT INTO provinces (province_id, province_name) VALUES 
            (1, 'Metro Manila'),
            (2, 'Cebu'),
            (3, 'Davao'),
            (4, 'Pampanga'),
            (5, 'Batangas')
        `);

        // Create cities table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS cities (
                id INT AUTO_INCREMENT PRIMARY KEY,
                city_name VARCHAR(100) NOT NULL,
                province_id INT NOT NULL,
                FOREIGN KEY (province_id) REFERENCES provinces(id)
            )
        `);

        // Insert default cities
        await connection.query(`
            INSERT INTO cities (city_name, province_id) VALUES 
            ('Makati', 1),
            ('Quezon City', 1),
            ('Cebu City', 2),
            ('Davao City', 3),
            ('San Fernando', 4),
            ('Batangas City', 5)
        `);

        console.log('Database and tables created successfully!');
        await connection.end();

    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    }
}

initDatabase();