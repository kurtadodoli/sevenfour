const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 's3v3n-f0ur-cl0thing*',
    database: 'seven_four_clothing'
};

async function fixSizesJSON() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        console.log('🔧 Fixing sizes JSON to match current variant data...\n');
        
        // Get all products with variants
        const [products] = await connection.execute(`
            SELECT DISTINCT pv.product_id, p.productname
            FROM product_variants pv
            JOIN products p ON pv.product_id = p.product_id
            ORDER BY p.productname
        `);
        
        console.log(`Found ${products.length} products with variants`);
        
        for (const product of products) {
            console.log(`\n📦 Processing: ${product.productname} (ID: ${product.product_id})`);
            
            // Get current variants for this product
            const [variants] = await connection.execute(`
                SELECT size, color, available_quantity, stock_quantity, reserved_quantity
                FROM product_variants 
                WHERE product_id = ? 
                ORDER BY size, color
            `, [product.product_id]);
            
            console.log(`  Found ${variants.length} variants`);
            
            // Build the sizes JSON structure
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
                    stock: variant.available_quantity  // Use available_quantity (what users can actually buy)
                });
                
                console.log(`    ${variant.size}/${variant.color}: Available: ${variant.available_quantity}, Stock: ${variant.stock_quantity}, Reserved: ${variant.reserved_quantity}`);
            });
            
            const newSizesArray = Object.values(sizesMap);
            const newSizesJSON = JSON.stringify(newSizesArray);
            
            // Update the products table
            await connection.execute(`
                UPDATE products 
                SET sizes = ?, last_stock_update = CURRENT_TIMESTAMP
                WHERE product_id = ?
            `, [newSizesJSON, product.product_id]);
            
            console.log(`  ✅ Updated sizes JSON`);
            
            // Show the new JSON structure
            newSizesArray.forEach(size => {
                console.log(`    Size ${size.size}:`);
                size.colorStocks.forEach(colorStock => {
                    console.log(`      ${colorStock.color}: ${colorStock.stock} units`);
                });
            });
        }
        
        console.log('\n🎯 Checking Strive Forward specifically...');
        
        // Check Strive Forward specifically
        const [striveForward] = await connection.execute(`
            SELECT product_id, productname, sizes, total_available_stock, total_reserved_stock
            FROM products 
            WHERE productname LIKE '%Strive Forward%'
        `);
        
        if (striveForward.length > 0) {
            const product = striveForward[0];
            console.log(`\n📊 Strive Forward after update:`);
            console.log(`  Total Available: ${product.total_available_stock}`);
            console.log(`  Total Reserved: ${product.total_reserved_stock}`);
            
            if (product.sizes) {
                const sizesData = JSON.parse(product.sizes);
                console.log(`  Sizes JSON:`);
                sizesData.forEach(size => {
                    console.log(`    Size ${size.size}:`);
                    size.colorStocks.forEach(colorStock => {
                        console.log(`      ${colorStock.color}: ${colorStock.stock} units`);
                    });
                });
            }
        }
        
        await connection.end();
        console.log('\n✅ All sizes JSON data updated successfully!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

fixSizesJSON();
