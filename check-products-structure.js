const mysql = require('mysql2/promise');

async function checkProductsTable() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 's3v3n-f0ur-cl0thing*',
            database: 'seven_four_clothing'
        });

        console.log('Products table structure:');
        const [columns] = await connection.execute('DESCRIBE products');
        columns.forEach(col => {
            console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
        });

        console.log('\nProducts table data:');
        const [products] = await connection.execute('SELECT * FROM products LIMIT 3');
        console.log(products);

        await connection.end();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkProductsTable();
