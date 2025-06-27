const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function checkPendingOrder() {
    const conn = await mysql.createConnection(dbConfig);
    
    // Get details of the pending cancellation request
    const [requestDetails] = await conn.execute(`
        SELECT cr.*, o.order_number, o.status as order_status,
               o.id as order_id, o.invoice_id
        FROM cancellation_requests cr
        JOIN orders o ON cr.order_id = o.id
        WHERE cr.id = 18
    `);
    
    if (requestDetails.length > 0) {
        const req = requestDetails[0];
        console.log('Pending cancellation request details:');
        console.log(`Order ID: ${req.order_id}, Order Number: ${req.order_number}`);
        console.log(`Order Status: ${req.order_status}, Cancellation Status: ${req.status}`);
        console.log(`Reason: ${req.reason}`);
        
        // Get order items
        const [orderItems] = await conn.execute(`
            SELECT oi.product_id, oi.quantity, oi.color, oi.size, p.productname
            FROM order_items oi
            JOIN orders o ON oi.invoice_id = o.invoice_id
            JOIN products p ON oi.product_id = p.product_id
            WHERE o.id = ?
        `, [req.order_id]);
        
        console.log('\nOrder items:');
        orderItems.forEach(item => {
            console.log(`- ${item.productname} (${item.color}/${item.size}): ${item.quantity} units`);
        });
        
        // Check current variant stock for these items
        console.log('\nCurrent variant stock:');
        for (const item of orderItems) {
            const [variantStock] = await conn.execute(`
                SELECT stock_quantity, available_quantity, reserved_quantity
                FROM product_variants 
                WHERE product_id = ? AND size = ? AND color = ?
            `, [item.product_id, item.size || 'N/A', item.color || 'Default']);
            
            if (variantStock.length > 0) {
                const variant = variantStock[0];
                console.log(`  ${item.productname} ${item.color}/${item.size}:`);
                console.log(`    Stock: ${variant.stock_quantity}, Available: ${variant.available_quantity}, Reserved: ${variant.reserved_quantity}`);
            } else {
                console.log(`  ${item.productname} ${item.color}/${item.size}: NO VARIANT FOUND`);
            }
        }
    }
    
    await conn.end();
}

checkPendingOrder().catch(console.error);
