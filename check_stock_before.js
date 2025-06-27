const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function checkStockBeforeTest() {
    const conn = await mysql.createConnection(dbConfig);
    
    // Check current stock for Strive Forward Black/L
    const [variant] = await conn.execute(`
        SELECT * FROM product_variants 
        WHERE product_id = 640009057958 AND size = 'L' AND color = 'Black'
    `);
    
    console.log('Current stock for Strive Forward Black/L:');
    if (variant.length > 0) {
        const v = variant[0];
        console.log(`Stock: ${v.stock_quantity}, Available: ${v.available_quantity}, Reserved: ${v.reserved_quantity}`);
    } else {
        console.log('No variant found');
    }
    
    // Check the order we just created
    const [order] = await conn.execute(`
        SELECT o.*, oi.product_id, oi.quantity, oi.color, oi.size, oi.product_name
        FROM orders o
        JOIN order_items oi ON o.invoice_id = oi.invoice_id
        WHERE o.id = 32
    `);
    
    console.log('\nTest order details:');
    if (order.length > 0) {
        const o = order[0];
        console.log(`Order ${o.id}: ${o.order_number} - Status: ${o.status}`);
        console.log(`Item: ${o.product_name} (${o.color}/${o.size}) x${o.quantity}`);
    }
    
    await conn.end();
}

checkStockBeforeTest().catch(console.error);
