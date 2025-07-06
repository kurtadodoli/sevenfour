require('dotenv').config({ path: './server/.env' });
const mysql = require('mysql2/promise');

async function checkCustomOrders() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });
    
    try {
        console.log('📋 CUSTOM_ORDERS TABLE SCHEMA:');
        const [columns] = await connection.execute('DESCRIBE custom_orders');
        columns.forEach(col => {
            console.log(`   ${col.Field} (${col.Type})`);
        });
        
        console.log('\n📊 Sample custom order record:');
        const [sample] = await connection.execute('SELECT * FROM custom_orders LIMIT 1');
        if (sample.length > 0) {
            Object.keys(sample[0]).forEach(key => {
                console.log(`   ${key}: ${sample[0][key]}`);
            });
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    }
    
    await connection.end();
}

checkCustomOrders();
