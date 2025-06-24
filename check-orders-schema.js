const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function checkOrdersSchema() {
    console.log('🔍 CHECKING ORDERS TABLE SCHEMA\n');
    
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        // Check orders table structure
        console.log('1. Orders table structure:');
        const [ordersSchema] = await connection.execute(`
            DESCRIBE orders
        `);
        
        console.log('Orders table columns:');
        ordersSchema.forEach(column => {
            console.log(`   - ${column.Field}: ${column.Type} ${column.Key ? `(${column.Key})` : ''}`);
        });
        
        // Check a few sample orders
        console.log('\n2. Sample orders:');
        const [sampleOrders] = await connection.execute(`
            SELECT * FROM orders LIMIT 3
        `);
        
        if (sampleOrders.length > 0) {
            console.log(`Found ${sampleOrders.length} sample orders:`);
            sampleOrders.forEach((order, index) => {
                console.log(`   ${index + 1}. Primary key: ${order[Object.keys(order)[0]]}, user_id: ${order.user_id}`);
            });
        } else {
            console.log('No orders found in table');
        }
        
        // Check order_invoices table structure
        console.log('\n3. Order invoices table structure:');
        const [invoicesSchema] = await connection.execute(`
            DESCRIBE order_invoices
        `);
        
        console.log('Order invoices table columns:');
        invoicesSchema.forEach(column => {
            console.log(`   - ${column.Field}: ${column.Type} ${column.Key ? `(${column.Key})` : ''}`);
        });
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkOrdersSchema();
