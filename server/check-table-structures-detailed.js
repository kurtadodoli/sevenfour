const mysql = require('mysql2/promise');
const { dbConfig } = require('./config/db');

async function checkTableStructures() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        
        console.log('Checking table structures...\n');
        
        // Check sales_transactions structure
        const [salesStructure] = await connection.execute('DESCRIBE sales_transactions');
        console.log('sales_transactions table structure:');
        salesStructure.forEach(row => {
            console.log(`  - ${row.Field}: ${row.Type} ${row.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
        });
        
        console.log('\n' + '='.repeat(50) + '\n');
        
        // Check order_invoices structure
        const [invoiceStructure] = await connection.execute('DESCRIBE order_invoices');
        console.log('order_invoices table structure:');
        invoiceStructure.forEach(row => {
            console.log(`  - ${row.Field}: ${row.Type} ${row.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
        });
        
        console.log('\n' + '='.repeat(50) + '\n');
        
        // Check sample data from sales_transactions
        const [salesData] = await connection.execute('SELECT * FROM sales_transactions LIMIT 3');
        console.log('Sample sales_transactions data:');
        console.log('Count:', salesData.length);
        if (salesData.length > 0) {
            console.log('Sample record:', JSON.stringify(salesData[0], null, 2));
        }
        
        console.log('\n' + '='.repeat(50) + '\n');
        
        // Check sample data from order_invoices
        const [invoiceData] = await connection.execute('SELECT * FROM order_invoices LIMIT 3');
        console.log('Sample order_invoices data:');
        console.log('Count:', invoiceData.length);
        if (invoiceData.length > 0) {
            console.log('Sample record:', JSON.stringify(invoiceData[0], null, 2));
        }
        
    } catch (error) {
        console.error('Error checking table structures:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

checkTableStructures().then(() => {
    console.log('\nTable structure check completed');
    process.exit(0);
}).catch(error => {
    console.error('Script error:', error);
    process.exit(1);
});
