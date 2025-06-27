const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function syncProductTotals() {
    const conn = await mysql.createConnection(dbConfig);
    
    try {
        await conn.beginTransaction();
        
        console.log('=== SYNCING PRODUCT TOTALS FROM VARIANTS ===');
        
        // Check current product-level totals
        const [beforeProduct] = await conn.execute(`
            SELECT product_id, productname, total_stock, total_available_stock, total_reserved_stock, stock_status
            FROM products 
            WHERE product_id = 640009057958
        `);
        
        console.log('Product totals BEFORE sync:');
        if (beforeProduct.length > 0) {
            const p = beforeProduct[0];
            console.log(`${p.productname}: Stock: ${p.total_stock}, Available: ${p.total_available_stock}, Reserved: ${p.total_reserved_stock}, Status: ${p.stock_status}`);
        }
        
        // Get variant totals
        const [variants] = await conn.execute(`
            SELECT size, color, stock_quantity, available_quantity, reserved_quantity
            FROM product_variants 
            WHERE product_id = 640009057958
        `);
        
        console.log('\nVariant breakdown:');
        let totalStock = 0, totalAvailable = 0, totalReserved = 0;
        variants.forEach(v => {
            console.log(`  ${v.size}/${v.color}: Stock: ${v.stock_quantity}, Available: ${v.available_quantity}, Reserved: ${v.reserved_quantity}`);
            totalStock += v.stock_quantity;
            totalAvailable += v.available_quantity;
            totalReserved += v.reserved_quantity;
        });
        
        console.log(`\nCalculated totals: Stock: ${totalStock}, Available: ${totalAvailable}, Reserved: ${totalReserved}`);
        
        // Update product-level totals from variants
        await conn.execute(`
            UPDATE products p
            SET p.total_stock = (
                SELECT COALESCE(SUM(pv.stock_quantity), 0) 
                FROM product_variants pv 
                WHERE pv.product_id = p.product_id
            ),
            p.total_available_stock = (
                SELECT COALESCE(SUM(pv.available_quantity), 0) 
                FROM product_variants pv 
                WHERE pv.product_id = p.product_id
            ),
            p.total_reserved_stock = (
                SELECT COALESCE(SUM(pv.reserved_quantity), 0) 
                FROM product_variants pv 
                WHERE pv.product_id = p.product_id
            ),
            p.stock_status = CASE 
                WHEN (SELECT COALESCE(SUM(pv.available_quantity), 0) FROM product_variants pv WHERE pv.product_id = p.product_id) <= 0 THEN 'out_of_stock'
                WHEN (SELECT COALESCE(SUM(pv.available_quantity), 0) FROM product_variants pv WHERE pv.product_id = p.product_id) <= 5 THEN 'critical_stock'
                WHEN (SELECT COALESCE(SUM(pv.available_quantity), 0) FROM product_variants pv WHERE pv.product_id = p.product_id) <= 15 THEN 'low_stock'
                ELSE 'in_stock'
            END,
            p.last_stock_update = CURRENT_TIMESTAMP
            WHERE p.product_id = 640009057958
        `);
        
        // Also update the sizes JSON field
        const sizesMap = {};
        variants.forEach(variant => {
            if (!sizesMap[variant.size]) {
                sizesMap[variant.size] = {
                    size: variant.size,
                    colorStocks: []
                };
            }
            sizesMap[variant.size].colorStocks.push({
                color: variant.color,
                stock: variant.available_quantity
            });
        });
        
        const newSizesArray = Object.values(sizesMap);
        const newSizesJSON = JSON.stringify(newSizesArray);
        
        await conn.execute(
            'UPDATE products SET sizes = ? WHERE product_id = 640009057958',
            [newSizesJSON]
        );
        
        // Check product totals after sync
        const [afterProduct] = await conn.execute(`
            SELECT product_id, productname, total_stock, total_available_stock, total_reserved_stock, stock_status, sizes
            FROM products 
            WHERE product_id = 640009057958
        `);
        
        console.log('\nProduct totals AFTER sync:');
        if (afterProduct.length > 0) {
            const p = afterProduct[0];
            console.log(`${p.productname}: Stock: ${p.total_stock}, Available: ${p.total_available_stock}, Reserved: ${p.total_reserved_stock}, Status: ${p.stock_status}`);
            console.log('Sizes JSON:', p.sizes);
        }
        
        await conn.commit();
        console.log('\n✅ Product totals synced successfully!');
        
    } catch (error) {
        await conn.rollback();
        console.error('❌ Error syncing product totals:', error);
    }
    
    await conn.end();
}

syncProductTotals().catch(console.error);
