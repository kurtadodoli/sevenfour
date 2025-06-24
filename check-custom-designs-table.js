const mysql = require('mysql2/promise');

async function checkCustomDesignsTable() {
    console.log('🔍 Checking custom_designs table structure...\n');
    
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 's3v3n-f0ur-cl0thing*',
        database: 'seven_four_clothing'
    });
    
    try {
        // Check if custom_designs table exists
        const [tables] = await connection.execute(`SHOW TABLES LIKE 'custom_designs'`);
        console.log('Tables matching custom_designs:', tables);
        
        if (tables.length > 0) {
            // Check table structure
            const [structure] = await connection.execute('DESCRIBE custom_designs');
            console.log('Custom_designs table structure:');
            console.table(structure);
            
            // Check data in the table
            const [data] = await connection.execute('SELECT * FROM custom_designs LIMIT 3');
            console.log('\nSample data:');
            console.table(data);
        } else {
            console.log('❌ custom_designs table does not exist');
            
            // Let's see what tables exist related to custom orders
            const [allTables] = await connection.execute(`SHOW TABLES LIKE '%custom%'`);
            console.log('Tables with "custom" in name:');
            console.table(allTables);
        }
        
    } catch (error) {
        console.error('Error checking custom_designs table:', error.message);
    } finally {
        await connection.end();
    }
}

checkCustomDesignsTable();
