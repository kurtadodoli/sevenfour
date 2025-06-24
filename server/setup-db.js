const mysql = require('mysql2/promise');
const { dbConfig } = require('./config/db');
const fs = require('fs');
const path = require('path');

async function setupTables() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to database');
        
        // Check if custom_designs table exists
        const [tables] = await connection.execute("SHOW TABLES LIKE 'custom_designs'");
        
        if (tables.length === 0) {
            console.log('❌ custom_designs table not found. Creating tables...');
            
            // Read and execute the SQL script
            const sqlContent = fs.readFileSync(path.join(__dirname, 'sql', 'create_custom_design_tables.sql'), 'utf8');
            
            // Execute the SQL script
            await connection.execute(sqlContent);
            console.log('✅ Tables created successfully');
        } else {
            console.log('✅ custom_designs table already exists');
        }
        
        // Test a simple query
        const [result] = await connection.execute('SELECT COUNT(*) as count FROM custom_designs');
        console.log(`📊 Custom designs in database: ${result[0].count}`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

setupTables();
