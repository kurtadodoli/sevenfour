const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function checkOrderStatus() {
    const conn = await mysql.createConnection(dbConfig);
    
    // Check recent orders and their status
    const [orders] = await conn.execute(`
        SELECT o.id, o.order_number, o.status, o.user_id,
               cr.status as cancellation_status, cr.reason
        FROM orders o
        LEFT JOIN cancellation_requests cr ON o.id = cr.order_id
        ORDER BY o.id DESC LIMIT 10
    `);
    
    console.log('Recent orders:');
    orders.forEach(order => {
        console.log(`Order ${order.id}: ${order.order_number} - Status: ${order.status} - Cancellation: ${order.cancellation_status || 'none'}`);
    });
    
    // Check if there are any pending cancellation requests
    const [pendingCancellations] = await conn.execute(`
        SELECT cr.id, cr.order_id, cr.reason, cr.status, o.order_number, o.status as order_status
        FROM cancellation_requests cr
        JOIN orders o ON cr.order_id = o.id
        WHERE cr.status = 'pending'
    `);
    
    console.log('\nPending cancellation requests:');
    pendingCancellations.forEach(req => {
        console.log(`Request ${req.id}: Order ${req.order_number} (${req.order_status}) - Reason: ${req.reason}`);
    });
    
    await conn.end();
}

checkOrderStatus().catch(console.error);
