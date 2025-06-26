const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function checkCurrentState() {
    const conn = await mysql.createConnection(dbConfig);
    
    // Check current stock state
    const [currentStock] = await conn.execute(`
        SELECT size, color, stock_quantity, available_quantity, reserved_quantity, last_updated
        FROM product_variants 
        WHERE product_id = 640009057958
        ORDER BY size, color
    `);
    
    console.log('=== CURRENT STOCK STATE ===');
    currentStock.forEach(v => {
        console.log(`${v.size}/${v.color}: Stock: ${v.stock_quantity}, Available: ${v.available_quantity}, Reserved: ${v.reserved_quantity} (Updated: ${v.last_updated})`);
    });
    
    // Check recent orders
    const [recentOrders] = await conn.execute(`
        SELECT o.id, o.order_number, o.status, o.created_at,
               oi.product_name, oi.quantity, oi.color, oi.size
        FROM orders o
        JOIN order_items oi ON o.invoice_id = oi.invoice_id
        WHERE oi.product_id = 640009057958
        ORDER BY o.created_at DESC LIMIT 10
    `);
    
    console.log('\n=== RECENT ORDERS FOR STRIVE FORWARD ===');
    recentOrders.forEach(o => {
        console.log(`Order ${o.id} (${o.order_number}): ${o.status} - ${o.product_name} ${o.color}/${o.size} x${o.quantity} (${o.created_at})`);
    });
    
    // Check pending cancellations
    const [pendingCancellations] = await conn.execute(`
        SELECT cr.id, cr.order_id, cr.status, o.order_number, o.status as order_status
        FROM cancellation_requests cr
        JOIN orders o ON cr.order_id = o.id
        JOIN order_items oi ON o.invoice_id = oi.invoice_id
        WHERE oi.product_id = 640009057958 AND cr.status = 'pending'
    `);
    
    console.log('\n=== PENDING CANCELLATIONS ===');
    if (pendingCancellations.length > 0) {
        pendingCancellations.forEach(c => {
            console.log(`Request ${c.id}: Order ${c.order_number} (${c.order_status}) - Status: ${c.status}`);
        });
    } else {
        console.log('No pending cancellations for Strive Forward');
    }
    
    // Check recent stock movements
    const [recentMovements] = await conn.execute(`
        SELECT * FROM stock_movements 
        WHERE product_id = 640009057958 
        ORDER BY created_at DESC LIMIT 10
    `);
    
    console.log('\n=== RECENT STOCK MOVEMENTS ===');
    recentMovements.forEach(m => {
        console.log(`${m.movement_type} ${m.quantity} units (${m.size}) - ${m.reason} - ${m.created_at.toISOString().slice(0, 19)}`);
    });
    
    await conn.end();
}

checkCurrentState().catch(console.error);
