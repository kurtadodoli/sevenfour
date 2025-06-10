const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

async function runMigration() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        console.log('Running profile features migration...');

        // Read and execute the migration SQL
        const migrationPath = path.join(__dirname, '..', 'migrations', '002_add_profile_features.sql');
        const sql = await fs.readFile(migrationPath, 'utf8');
        
        // Split into individual statements and execute each one
        const statements = sql.split(';').filter(stmt => stmt.trim());
        for (const statement of statements) {
            if (statement.trim()) {
                await pool.query(statement);
                console.log('Executed:', statement.trim().split('\n')[0]);
            }
        }

        console.log('Migration completed successfully');

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await pool.end();
    }
}

runMigration();
