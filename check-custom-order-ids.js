const mysql = require('mysql2/promise');

async function checkCustomOrders() {
    try {
        console.log('🔍 Checking custom orders structure...');
        
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'admin',
            database: 'sfc_store'
        });

        // Get custom orders
        const [orders] = await connection.execute(`
            SELECT id, custom_order_id, status, created_at 
            FROM custom_orders 
            ORDER BY created_at DESC 
            LIMIT 5
        `);
        
        console.log('\n📋 Recent Custom Orders:');
        console.log('============================');
        orders.forEach(order => {
            console.log(`ID: ${order.id} | Custom Order ID: ${order.custom_order_id} | Status: ${order.status}`);
        });
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkCustomOrders();
