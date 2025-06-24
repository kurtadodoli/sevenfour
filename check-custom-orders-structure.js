const mysql = require('mysql2/promise');

async function checkCustomOrdersTable() {
    console.log('🔍 Checking custom_orders table structure...\n');
    
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 's3v3n-f0ur-cl0thing*',
        database: 'seven_four_clothing'
    });
    
    try {
        // Check table structure
        const [structure] = await connection.execute('DESCRIBE custom_orders');
        console.log('Custom_orders table structure:');
        console.table(structure);
        
        // Check some sample data
        const [orders] = await connection.execute('SELECT * FROM custom_orders LIMIT 3');
        console.log('\nSample orders:');
        console.table(orders);
        
        // Check custom_order_images table
        const [imageStructure] = await connection.execute('DESCRIBE custom_order_images');
        console.log('\nCustom_order_images table structure:');
        console.table(imageStructure);
        
    } catch (error) {
        console.error('Error checking tables:', error.message);
    } finally {
        await connection.end();
    }
}

checkCustomOrdersTable();
