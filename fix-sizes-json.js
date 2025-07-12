const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function fixSizesJSON() {
    const connection = await mysql.createConnection(dbConfig);
    
    console.log('=== FIXING SIZES JSON TO MATCH PRODUCT_VARIANTS ===');
    
    // Get all products with variants
    const [products] = await connection.execute(`
        SELECT DISTINCT p.product_id, p.productname, p.sizes
        FROM products p
        WHERE EXISTS (
            SELECT 1 FROM product_variants pv WHERE pv.product_id = p.product_id
        )
    `);
    
    for (const product of products) {
        console.log(`\n--- Processing ${product.productname} (ID: ${product.product_id}) ---`);
        
        // Get all variants for this product
        const [variants] = await connection.execute(`
            SELECT size, color, available_quantity, stock_quantity
            FROM product_variants
            WHERE product_id = ?
            ORDER BY size, color
        `, [product.product_id]);
        
        console.log('Current variants:');
        variants.forEach(v => {
            console.log(`  ${v.size} ${v.color}: available=${v.available_quantity}, stock=${v.stock_quantity}`);
        });
        
        // Build new sizes JSON from variants
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
                stock: variant.available_quantity // Use available_quantity
            });
        });
        
        const newSizesJSON = Object.values(sizesMap);
        
        console.log('New sizes JSON:', JSON.stringify(newSizesJSON, null, 2));
        
        // Update the products table
        const [updateResult] = await connection.execute(`
            UPDATE products 
            SET sizes = ?,
                total_available_stock = (
                    SELECT COALESCE(SUM(available_quantity), 0) 
                    FROM product_variants 
                    WHERE product_id = ?
                )
            WHERE product_id = ?
        `, [JSON.stringify(newSizesJSON), product.product_id, product.product_id]);
        
        console.log(`✅ Updated ${product.productname} - affected rows: ${updateResult.affectedRows}`);
    }
    
    await connection.end();
    console.log('\n=== SIZES JSON SYNC COMPLETE ===');
}

fixSizesJSON().catch(console.error);
