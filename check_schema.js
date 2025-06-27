const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function checkSchema() {
    const conn = await mysql.createConnection(dbConfig);
    
    // Check the structure of order_invoices table
    const [columns] = await conn.execute('DESCRIBE order_invoices');
    console.log('order_invoices columns:');
    columns.forEach(col => {
        console.log(`${col.Field}: ${col.Type} (${col.Key || 'no key'})`);
    });
    
    // Check existing values in invoice_status
    const [statuses] = await conn.execute('SELECT DISTINCT invoice_status FROM order_invoices');
    console.log('\nExisting invoice_status values:');
    statuses.forEach(s => console.log(s.invoice_status));
    
    await conn.end();
}

checkSchema().catch(console.error);
