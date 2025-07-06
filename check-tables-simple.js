const mysql = require('mysql2/promise');
require('dotenv').config({ path: './server/.env' });

async function checkTablesStructure() {
    let db;
    try {
        console.log('🔍 Checking Tables Structure...\n');

        db = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'seven_four_clothing'
        });

        console.log('✅ Connected to database');

        // Check orders table structure
        console.log('\n📋 ORDERS TABLE COLUMNS:');
        const [ordersColumns] = await db.execute('DESCRIBE orders');
        ordersColumns.forEach(col => {
            console.log(`  ${col.Field} (${col.Type}) - ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}${col.Default ? ` DEFAULT: ${col.Default}` : ''}`);
        });

        // Check order_items table structure
        console.log('\n📋 ORDER_ITEMS TABLE COLUMNS:');
        const [orderItemsColumns] = await db.execute('DESCRIBE order_items');
        orderItemsColumns.forEach(col => {
            console.log(`  ${col.Field} (${col.Type}) - ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}${col.Default ? ` DEFAULT: ${col.Default}` : ''}`);
        });

    } catch (error) {
        console.error('\n❌ Error:', error);
    } finally {
        if (db) {
            await db.end();
            console.log('\n🔌 Database connection closed');
        }
    }
}

checkTablesStructure();
