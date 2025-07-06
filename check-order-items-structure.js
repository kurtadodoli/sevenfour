const mysql = require('mysql2/promise');

async function checkOrderItemsStructure() {
    console.log('📋 CHECKING ORDER_ITEMS TABLE STRUCTURE');
    
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 's3v3n-f0ur-cl0thing*',
        database: 'seven_four_clothing',
        charset: 'utf8mb4'
    });

    try {
        // Check order_items table structure
        console.log('\n📦 ORDER_ITEMS TABLE STRUCTURE:');
        const [columns] = await connection.execute('DESCRIBE order_items');
        columns.forEach(col => {
            const indicator = col.Field === 'customer_fullname' ? '🚨 ' : '   ';
            const required = col.Null === 'NO' && col.Default === null ? ' (REQUIRED!)' : '';
            console.log(`${indicator}${col.Field} | ${col.Type} | Null: ${col.Null} | Default: ${col.Default}${required}`);
        });
        
        // Show which fields are NOT NULL and have no default
        console.log('\n⚠️ REQUIRED FIELDS (NOT NULL + NO DEFAULT):');
        const requiredFields = columns.filter(col => col.Null === 'NO' && (col.Default === null || col.Default === ''));
        requiredFields.forEach(col => {
            console.log(`- ${col.Field} (${col.Type})`);
        });

        console.log('\n🔧 SOLUTION:');
        console.log('The order_items INSERT statement must include customer_fullname');
        console.log('OR we need to add a default value to the customer_fullname column');
        console.log('OR we need to make the customer_fullname column nullable');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await connection.end();
    }
}

checkOrderItemsStructure().catch(console.error);
