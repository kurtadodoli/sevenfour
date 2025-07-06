const mysql = require('mysql2/promise');

async function checkTable() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root', 
        password: 's3v3n-f0ur-cl0thing*',
        database: 'seven_four_clothing'
    });
    
    const [result] = await connection.execute('DESCRIBE refund_requests');
    console.log('refund_requests table structure:');
    result.forEach((col, index) => {
        console.log(`${index + 1}. ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Default ? 'DEFAULT ' + col.Default : ''}`);
    });
    
    await connection.end();
}

checkTable().catch(console.error);
