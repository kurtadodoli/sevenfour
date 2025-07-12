const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function checkRecentOrders() {
    const connection = await mysql.createConnection(dbConfig);
    
    // Check recent orders for Lightning Mesh Shorts
    const [orders] = await connection.execute(`
        SELECT o.order_number, o.order_date, oi.product_name, oi.size, oi.color, oi.quantity
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN products p ON oi.product_id = p.product_id
        WHERE p.productname LIKE '%Lightning Mesh%'
        ORDER BY o.order_date DESC
        LIMIT 10
    `);
    
    console.log('=== RECENT ORDERS FOR MESH SHORTS ===');
    orders.forEach(order => {
        console.log(`Order ${order.order_number} (${order.order_date}): ${order.product_name} ${order.size} ${order.color} x${order.quantity}`);
    });
    
    // Check stock movements
    const [movements] = await connection.execute(`
        SELECT sm.*, p.productname
        FROM stock_movements sm
        JOIN products p ON sm.product_id = p.product_id
        WHERE p.productname LIKE '%Lightning Mesh%'
        ORDER BY sm.created_at DESC
        LIMIT 10
    `);
    
    console.log('=== RECENT STOCK MOVEMENTS ===');
    movements.forEach(movement => {
        console.log(`${movement.created_at}: ${movement.productname} ${movement.size} - ${movement.movement_type} ${movement.quantity} (${movement.reason})`);
    });
    
    await connection.end();
}

checkRecentOrders().catch(console.error);
