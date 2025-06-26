const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function verifyStockSync() {
    const conn = await mysql.createConnection(dbConfig);
    
    // Check the product-level stock totals
    const [product] = await conn.execute(`
        SELECT product_id, productname, total_stock, total_available_stock, total_reserved_stock, stock_status
        FROM products 
        WHERE product_id = 640009057958
    `);
    
    console.log('Product-level stock totals:');
    if (product.length > 0) {
        const p = product[0];
        console.log(`${p.productname}:`);
        console.log(`  Total Stock: ${p.total_stock}`);
        console.log(`  Total Available: ${p.total_available_stock}`);
        console.log(`  Total Reserved: ${p.total_reserved_stock}`);
        console.log(`  Status: ${p.stock_status}`);
    }
    
    // Check all variants for this product
    const [variants] = await conn.execute(`
        SELECT size, color, stock_quantity, available_quantity, reserved_quantity
        FROM product_variants 
        WHERE product_id = 640009057958
        ORDER BY size, color
    `);
    
    console.log('\nVariant-level stock:');
    variants.forEach(v => {
        console.log(`  ${v.size}/${v.color}: Stock: ${v.stock_quantity}, Available: ${v.available_quantity}, Reserved: ${v.reserved_quantity}`);
    });
    
    // Calculate totals from variants to verify sync
    const totalStock = variants.reduce((sum, v) => sum + v.stock_quantity, 0);
    const totalAvailable = variants.reduce((sum, v) => sum + v.available_quantity, 0);
    const totalReserved = variants.reduce((sum, v) => sum + v.reserved_quantity, 0);
    
    console.log('\nCalculated totals from variants:');
    console.log(`  Total Stock: ${totalStock}`);
    console.log(`  Total Available: ${totalAvailable}`);
    console.log(`  Total Reserved: ${totalReserved}`);
    
    // Check if they match the product-level totals
    if (product.length > 0) {
        const p = product[0];
        const stockMatch = p.total_stock === totalStock;
        const availableMatch = p.total_available_stock === totalAvailable;
        const reservedMatch = p.total_reserved_stock === totalReserved;
        
        console.log('\nSync verification:');
        console.log(`  Stock totals match: ${stockMatch ? '✅' : '❌'}`);
        console.log(`  Available totals match: ${availableMatch ? '✅' : '❌'}`);
        console.log(`  Reserved totals match: ${reservedMatch ? '✅' : '❌'}`);
        
        if (stockMatch && availableMatch && reservedMatch) {
            console.log('\n🎉 All stock data is properly synced!');
        } else {
            console.log('\n⚠️ Stock data sync issues detected');
        }
    }
    
    // Check recent stock movements
    const [movements] = await conn.execute(`
        SELECT * FROM stock_movements 
        WHERE product_id = 640009057958 
        ORDER BY created_at DESC LIMIT 5
    `);
    
    console.log('\nRecent stock movements:');
    movements.forEach(m => {
        console.log(`  ${m.movement_type} ${m.quantity} units (${m.size}) - ${m.reason} - ${m.created_at}`);
    });
    
    await conn.end();
}

verifyStockSync().catch(console.error);
