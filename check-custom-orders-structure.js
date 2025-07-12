const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function checkCustomOrdersTable() {
    console.log('=== CHECKING CUSTOM ORDERS TABLE STRUCTURE ===');
    
    const connection = await mysql.createConnection(dbConfig);
    
    try {
        // Check table structure
        const [columns] = await connection.execute(`
            DESCRIBE custom_orders
        `);
        
        console.log('\n📋 custom_orders table structure:');
        columns.forEach((col, index) => {
            console.log(`${index + 1}. ${col.Field} (${col.Type}) - ${col.Null === 'YES' ? 'Nullable' : 'Not Null'}`);
        });
        
        // Check if received_at column exists
        const hasReceivedAt = columns.some(col => col.Field === 'received_at');
        console.log(`\n🔍 Has 'received_at' column: ${hasReceivedAt ? 'YES' : 'NO'}`);
        
        if (!hasReceivedAt) {
            console.log('\n⚠️ The received_at column does not exist in custom_orders table');
            console.log('💡 We should either:');
            console.log('   1. Remove the received_at reference from the UPDATE query');
            console.log('   2. Add the received_at column to the table');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await connection.end();
    }
}

checkCustomOrdersTable();
