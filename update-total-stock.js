const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function updateTotalStock() {
    const connection = await mysql.createConnection(dbConfig);
    
    // Update total_available_stock for Lightning Mesh Shorts
    const [result] = await connection.execute(`
        UPDATE products 
        SET total_available_stock = (
            SELECT COALESCE(SUM(available_quantity), 0) 
            FROM product_variants 
            WHERE product_id = products.product_id
        )
        WHERE product_id = 554415049535
    `);
    
    console.log('Updated total stock, affected rows:', result.affectedRows);
    
    // Verify the update
    const [products] = await connection.execute('SELECT product_id, productname, total_available_stock FROM products WHERE product_id = 554415049535');
    console.log('New total stock:', products[0].total_available_stock);
    
    await connection.end();
}

updateTotalStock().catch(console.error);
