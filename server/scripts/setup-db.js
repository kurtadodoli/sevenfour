require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

async function setupDatabase() {
    const pool = await mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        multipleStatements: true
    });

    try {
        console.log('Reading SQL file...');
        const sqlFile = await fs.readFile(path.join(__dirname, '../database/setup.sql'), 'utf8');
        
        console.log('Executing SQL...');
        await pool.query(sqlFile);
        
        console.log('✅ Database setup completed successfully');
        
    } catch (error) {
        console.error('❌ Database setup error:', error);
    } finally {
        await pool.end();
    }
}

setupDatabase();
