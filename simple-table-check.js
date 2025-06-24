const mysql = require('mysql2/promise');

async function checkTable() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 's3v3n-f0ur-cl0thing*',
        database: 'seven_four_clothing'
    });
    
    try {
        const [result] = await connection.execute('SHOW COLUMNS FROM custom_designs');
        console.log('Custom designs table columns:');
        result.forEach(col => {
            console.log(`${col.Field} - ${col.Type} - ${col.Null} - ${col.Key} - ${col.Default} - ${col.Extra}`);
        });
        
        const [statusData] = await connection.execute('SELECT DISTINCT status FROM custom_designs');
        console.log('\nStatus values:');
        statusData.forEach(row => console.log(`- ${row.status}`));
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await connection.end();
    }
}

checkTable();
