require('dotenv').config({ path: './server/.env' });
const mysql = require('mysql2/promise');

async function investigateIssue() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });
    
    console.log('🔍 INVESTIGATING THE DUPLICATE ORDER ISSUE');
    console.log('==========================================');
    
    // Check the specific orders mentioned
    const [customOrder] = await connection.execute(`
        SELECT * FROM custom_orders WHERE custom_order_id = 'CUSTOM-MCQ946KQ-R0MKD'
    `);
    
    if (customOrder.length > 0) {
        const order = customOrder[0];
        console.log('📋 ORIGINAL CUSTOM ORDER:');
        console.log(`   ID: ${order.custom_order_id}`);
        console.log(`   Status: ${order.status}`);
        console.log(`   Payment Status: ${order.payment_status}`);
        console.log(`   Customer: ${order.customer_name}`);
        console.log(`   Created: ${order.created_at}`);
        console.log(`   Updated: ${order.updated_at}`);
    }
    
    // Check for delivery orders
    const [deliveryOrders] = await connection.execute(`
        SELECT * FROM orders WHERE order_number LIKE '%MCQ946KQ-R0MKD%' OR order_number LIKE '%KQ-R0MKD-6358%'
    `);
    
    console.log(`\n🚚 DELIVERY ORDERS FOUND: ${deliveryOrders.length}`);
    deliveryOrders.forEach((order, i) => {
        console.log(`   Order ${i+1}:`);
        console.log(`     Number: ${order.order_number}`);
        console.log(`     Status: ${order.status}`);
        console.log(`     Total: ${order.total_amount}`);
        console.log(`     Created: ${order.created_at}`);
        console.log(`     Notes: ${order.notes}`);
    });
    
    // Check for any orders in the regular orders table that might be duplicates
    const [regularOrders] = await connection.execute(`
        SELECT * FROM orders WHERE order_number LIKE '%R0MKD%'
    `);
    
    console.log(`\n📦 REGULAR ORDERS WITH R0MKD: ${regularOrders.length}`);
    regularOrders.forEach((order, i) => {
        console.log(`   Order ${i+1}:`);
        console.log(`     Number: ${order.order_number}`);
        console.log(`     User ID: ${order.user_id}`);
        console.log(`     Status: ${order.status}`);
        console.log(`     Payment Status: ${order.payment_status}`);
        console.log(`     Total: ${order.total_amount}`);
        console.log(`     Created: ${order.created_at}`);
        console.log(`     Notes: ${order.notes || 'No notes'}`);
    });
    
    await connection.end();
}

investigateIssue();
