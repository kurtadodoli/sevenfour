const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function checkCustomOrdersSchema() {
    let connection;
    try {
        console.log('🔍 Checking custom_orders table schema...');
        
        connection = await mysql.createConnection(dbConfig);
        
        // Get table structure
        const [structure] = await connection.execute(`DESCRIBE custom_orders`);
        
        console.log('\n📋 custom_orders table structure:');
        structure.forEach(column => {
            console.log(`  ${column.Field}: ${column.Type} ${column.Null === 'YES' ? '(nullable)' : '(not null)'} ${column.Key ? `(${column.Key})` : ''}`);
        });
        
        // Get total count
        const [countResult] = await connection.execute(`SELECT COUNT(*) as total FROM custom_orders`);
        console.log(`\n📊 Total records: ${countResult[0].total}`);
        
        // Sample a few records to see actual data
        const [sample] = await connection.execute(`
            SELECT * FROM custom_orders 
            ORDER BY created_at DESC 
            LIMIT 3
        `);
        
        console.log('\n🔍 Sample records:');
        sample.forEach((record, index) => {
            console.log(`\nRecord ${index + 1}:`);
            Object.keys(record).forEach(key => {
                console.log(`  ${key}: ${record[key]}`);
            });
        });
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Error checking schema:', error);
        if (connection) {
            await connection.end();
        }
    }
}

checkCustomOrdersSchema().then(() => {
    console.log('\n✅ Schema check complete');
    process.exit(0);
}).catch(err => {
    console.error('💥 Schema check failed:', err);
    process.exit(1);
});
