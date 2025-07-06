const mysql = require('mysql2/promise');
const { dbConfig } = require('./config/db');

async function checkTransactionTables() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        
        console.log('Checking transaction-related tables...\n');
        
        // Check what transaction-related tables exist
        const [tables] = await connection.execute("SHOW TABLES LIKE '%transaction%'");
        console.log('Transaction tables found:');
        tables.forEach(table => {
            console.log(`  - ${Object.values(table)[0]}`);
        });
        
        console.log('\n' + '='.repeat(50) + '\n');
        
        // Check what sales-related tables exist
        const [salesTables] = await connection.execute("SHOW TABLES LIKE '%sales%'");
        console.log('Sales tables found:');
        salesTables.forEach(table => {
            console.log(`  - ${Object.values(table)[0]}`);
        });
        
        console.log('\n' + '='.repeat(50) + '\n');
        
        // Check what invoice-related tables exist
        const [invoiceTables] = await connection.execute("SHOW TABLES LIKE '%invoice%'");
        console.log('Invoice tables found:');
        invoiceTables.forEach(table => {
            console.log(`  - ${Object.values(table)[0]}`);
        });
        
        console.log('\n' + '='.repeat(50) + '\n');
        
        // Check orders table structure
        const [ordersStructure] = await connection.execute('DESCRIBE orders');
        console.log('Orders table structure:');
        ordersStructure.forEach(row => {
            console.log(`  - ${row.Field}: ${row.Type}`);
        });
        
    } catch (error) {
        console.error('Error checking tables:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

checkTransactionTables().then(() => {
    console.log('\nTable check completed');
    process.exit(0);
}).catch(error => {
    console.error('Script error:', error);
    process.exit(1);
});
