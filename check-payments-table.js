const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function checkCustomOrderPaymentsTable() {
    console.log('=== CHECKING CUSTOM ORDER PAYMENTS TABLE ===');
    
    const connection = await mysql.createConnection(dbConfig);
    
    try {
        // Check table structure
        const [columns] = await connection.execute(`
            DESCRIBE custom_order_payments
        `);
        
        console.log('\n📋 custom_order_payments table structure:');
        columns.forEach((col, index) => {
            console.log(`${index + 1}. ${col.Field} (${col.Type}) - ${col.Null === 'YES' ? 'Nullable' : 'Not Null'}`);
        });
        
        // Check what data exists
        const [payments] = await connection.execute(`
            SELECT * FROM custom_order_payments LIMIT 3
        `);
        
        console.log(`\n📋 Sample payments (${payments.length} found):`);
        payments.forEach((payment, index) => {
            console.log(`${index + 1}. Payment:`, payment);
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await connection.end();
    }
}

checkCustomOrderPaymentsTable();
