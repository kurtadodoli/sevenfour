const mysql = require('mysql2/promise');
const { dbConfig } = require('./config/db');

async function checkOrderData() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        console.log('=== CHECKING ORDER DATA ===');
        
        // Check refund requests
        const [refundRequests] = await connection.execute(`
            SELECT id, order_id, order_number FROM refund_requests
        `);
        console.log('\nRefund requests:');
        refundRequests.forEach(rr => {
            console.log(`  ID: ${rr.id}, order_id: ${rr.order_id}, order_number: ${rr.order_number}`);
        });
        
        // Check orders
        const [orders] = await connection.execute(`
            SELECT id, order_number FROM orders WHERE id IN (${refundRequests.map(rr => rr.order_id).join(',')})
        `);
        console.log('\nCorresponding orders:');
        orders.forEach(o => {
            console.log(`  ID: ${o.id}, order_number: ${o.order_number}`);
        });
        
        // Check order items
        const [orderItems] = await connection.execute(`
            SELECT * FROM order_items WHERE order_id IN (${refundRequests.map(rr => rr.order_id).join(',')})
        `);
        console.log('\nCorresponding order items:');
        orderItems.forEach(oi => {
            console.log(`  Order ID: ${oi.order_id}, Product: ${oi.product_name}, Price: ${oi.product_price}, Qty: ${oi.quantity}`);
        });
        
        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkOrderData();
