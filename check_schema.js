const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function checkProductSchema() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        const [columns] = await connection.execute(`
            DESCRIBE products
        `);
        
        console.log('📋 Products table schema:');
        columns.forEach(col => {
            console.log(`${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(NULL)' : '(NOT NULL)'} ${col.Extra}`);
        });
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Error checking schema:', error);
    }
}

checkProductSchema();
