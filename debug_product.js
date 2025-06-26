const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function checkProduct() {
    const conn = await mysql.createConnection(dbConfig);
    
    // Check if product 576060214136 exists
    const [product] = await conn.execute(`
        SELECT * FROM products WHERE product_id = 576060214136
    `);
    
    console.log('Product 576060214136:');
    console.log(product[0] || 'Product not found');
    
    // Check variants for this product
    const [variants] = await conn.execute(`
        SELECT * FROM product_variants WHERE product_id = 576060214136
    `);
    
    console.log('\nVariants:');
    console.log(variants);
    
    // Try the exact query from the cancellation logic
    const [orderItems] = await conn.execute(`
        SELECT oi.product_id, oi.quantity, oi.color, oi.size, p.productname, 
               p.total_available_stock, p.total_reserved_stock
        FROM order_items oi
        JOIN orders o ON oi.invoice_id = o.invoice_id
        JOIN products p ON oi.product_id = p.product_id
        WHERE o.id = 13
    `);
    
    console.log('\nQuery result from cancellation logic:');
    console.log(orderItems);
    
    await conn.end();
}

checkProduct().catch(console.error);
