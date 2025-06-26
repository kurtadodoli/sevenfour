const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function checkCancellationSchema() {
    const conn = await mysql.createConnection(dbConfig);
    
    // Check the structure of cancellation_requests table
    const [columns] = await conn.execute('DESCRIBE cancellation_requests');
    console.log('cancellation_requests columns:');
    columns.forEach(col => {
        console.log(`${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'nullable' : 'not null'}) (${col.Key || 'no key'})`);
    });
    
    await conn.end();
}

checkCancellationSchema().catch(console.error);
