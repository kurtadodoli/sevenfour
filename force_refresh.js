const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function forceStockRefresh() {
    const conn = await mysql.createConnection(dbConfig);
    
    try {
        console.log('=== FORCING STOCK REFRESH ===');
        
        // Update the last_stock_update timestamp to trigger frontend refresh
        await conn.execute(`
            UPDATE products 
            SET last_stock_update = CURRENT_TIMESTAMP
            WHERE product_id = 640009057958
        `);
        
        // Also update variant timestamps
        await conn.execute(`
            UPDATE product_variants 
            SET last_updated = CURRENT_TIMESTAMP
            WHERE product_id = 640009057958
        `);
        
        console.log('✅ Stock timestamps updated to force frontend refresh');
        
        // Show the API response again
        const [product] = await conn.execute(`
            SELECT product_id, productname, total_stock, total_available_stock, total_reserved_stock, 
                   stock_status, sizes, last_stock_update
            FROM products 
            WHERE product_id = 640009057958
        `);
        
        if (product.length > 0) {
            const p = product[0];
            console.log(`\nProduct: ${p.productname}`);
            console.log(`Total Available: ${p.total_available_stock}`);
            console.log(`Last Updated: ${p.last_stock_update}`);
            console.log(`Sizes JSON: ${p.sizes}`);
        }
        
    } catch (error) {
        console.error('❌ Error forcing refresh:', error);
    }
    
    await conn.end();
}

forceStockRefresh().catch(console.error);
