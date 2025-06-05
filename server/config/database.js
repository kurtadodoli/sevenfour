const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

async function initDatabase() {
    let connection;
    try {
        console.log('Connecting to MySQL server...');
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        });

        console.log('Creating database...');
        await connection.query('DROP DATABASE IF EXISTS seven_four_clothing');
        await connection.query('CREATE DATABASE seven_four_clothing');
        await connection.query('USE seven_four_clothing');

        console.log('Creating tables...');
        await connection.query(`
            CREATE TABLE provinces (
                id INT AUTO_INCREMENT PRIMARY KEY,
                province_name VARCHAR(100) NOT NULL UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await connection.query(`
            CREATE TABLE cities (
                id INT AUTO_INCREMENT PRIMARY KEY,
                city_name VARCHAR(100) NOT NULL,
                province_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (province_id) REFERENCES provinces(id) ON DELETE CASCADE,
                UNIQUE KEY unique_city_province (city_name, province_id)
            )
        `);

        await connection.query(`
            CREATE TABLE users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                email VARCHAR(100) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                birthday DATE NOT NULL,
                gender ENUM('MALE', 'FEMALE', 'PREFER_NOT_TO_SAY') NOT NULL DEFAULT 'PREFER_NOT_TO_SAY',
                province_id INT NOT NULL,
                city_id INT NOT NULL,
                newsletter BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (province_id) REFERENCES provinces(id),
                FOREIGN KEY (city_id) REFERENCES cities(id)
            )
        `);

        console.log('Inserting default data...');
        await connection.query(`
            INSERT INTO provinces (province_name) VALUES 
            ('Metro Manila'),
            ('Cebu'),
            ('Davao'),
            ('Pampanga'),
            ('Batangas')
        `);

        await connection.query(`
            INSERT INTO cities (city_name, province_id) VALUES 
            ('Makati', 1),
            ('Quezon City', 1),
            ('Manila', 1),
            ('Taguig', 1),
            ('Cebu City', 2),
            ('Mandaue', 2),
            ('Lapu-Lapu', 2),
            ('Davao City', 3),
            ('Tagum', 3),
            ('Digos', 3),
            ('San Fernando', 4),
            ('Angeles', 4),
            ('Mabalacat', 4),
            ('Batangas City', 5),
            ('Lipa', 5),
            ('Tanauan', 5)
        `);

        console.log('Database initialized successfully!');

    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = { pool, initDatabase };