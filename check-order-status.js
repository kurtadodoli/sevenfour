require('dotenv').config({ path: './server/.env' });
const mysql = require('mysql2/promise');

async function checkOrderStatus() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });
    
    // Check the specific order from the screenshot
    const [order] = await connection.execute(`
        SELECT custom_order_id, status, payment_status, delivery_status
        FROM custom_orders 
        WHERE custom_order_id = 'CUSTOM-MCQ9NJZ0-1AYJD'
    `);
    
    if (order.length > 0) {
        console.log('📋 Order Status:');
        console.log(`   Custom Order ID: ${order[0].custom_order_id}`);
        console.log(`   Status: ${order[0].status}`);
        console.log(`   Payment Status: ${order[0].payment_status}`);
        console.log(`   Delivery Status: ${order[0].delivery_status}`);
    } else {
        console.log('❌ Order not found');
    }
    
    await connection.end();
}

checkOrderStatus();
