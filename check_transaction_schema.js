const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function checkTransactionSchema() {
    const conn = await mysql.createConnection(dbConfig);
    
    // Check the structure of sales_transactions table
    const [columns] = await conn.execute('DESCRIBE sales_transactions');
    console.log('sales_transactions columns:');
    columns.forEach(col => {
        console.log(`${col.Field}: ${col.Type} (${col.Key || 'no key'})`);
    });
    
    // Check existing values
    const [statuses] = await conn.execute('SELECT DISTINCT transaction_status FROM sales_transactions');
    console.log('\nExisting transaction_status values:');
    statuses.forEach(s => console.log(s.transaction_status));
    
    const [methods] = await conn.execute('SELECT DISTINCT payment_method FROM sales_transactions');
    console.log('\nExisting payment_method values:');
    methods.forEach(m => console.log(m.payment_method));
    
    await conn.end();
}

checkTransactionSchema().catch(console.error);
