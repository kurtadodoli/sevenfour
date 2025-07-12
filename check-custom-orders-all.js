const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function checkCustomOrders() {
    console.log('=== CHECKING CUSTOM ORDERS TABLE ===');
    
    const connection = await mysql.createConnection(dbConfig);
    
    try {
        // Check all custom orders
        const [allOrders] = await connection.execute(`
            SELECT custom_order_id, status, delivery_status, customer_email, created_at
            FROM custom_orders 
            ORDER BY created_at DESC 
            LIMIT 10
        `);
        
        console.log(`\n📋 Found ${allOrders.length} custom orders:`);
        allOrders.forEach((order, index) => {
            console.log(`${index + 1}. ID: ${order.custom_order_id}, Status: ${order.status}, Delivery: ${order.delivery_status}, Email: ${order.customer_email}`);
        });
        
        // Get the order from the browser error (SNSHEW-E616P)
        const [specificOrder] = await connection.execute(`
            SELECT * FROM custom_orders WHERE custom_order_id = ?
        `, ['SNSHEW-E616P']);
        
        if (specificOrder.length > 0) {
            console.log('\n🔍 Found the specific order from browser error:');
            console.log(JSON.stringify(specificOrder[0], null, 2));
        } else {
            console.log('\n❌ Order SNSHEW-E616P not found in database');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await connection.end();
    }
}

checkCustomOrders();
