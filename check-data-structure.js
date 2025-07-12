const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function checkDataStructure() {
    const connection = await mysql.createConnection(dbConfig);
    
    console.log('=== CHECKING DATA STRUCTURE ===');
    
    // Check sizes JSON structure for a few products
    const [products] = await connection.execute('SELECT product_id, productname, sizes FROM products WHERE sizes IS NOT NULL LIMIT 3');
    
    console.log('=== SIZES JSON STRUCTURE ===');
    products.forEach(product => {
        console.log(`Product: ${product.productname} (ID: ${product.product_id})`);
        try {
            const sizes = JSON.parse(product.sizes);
            console.log('Sizes structure:', JSON.stringify(sizes, null, 2));
        } catch (e) {
            console.log('Invalid JSON:', product.sizes);
        }
        console.log('---');
    });
    
    // Check product_variants for the same products
    console.log('=== PRODUCT VARIANTS ===');
    const [variants] = await connection.execute('SELECT product_id, size, color, available_quantity, stock_quantity FROM product_variants LIMIT 10');
    variants.forEach(variant => {
        console.log(`Product ${variant.product_id}: Size ${variant.size}, Color ${variant.color}, Available: ${variant.available_quantity}, Stock: ${variant.stock_quantity}`);
    });
    
    // Check if we have any Lightning Mesh Shorts
    console.log('=== LIGHTNING MESH SHORTS SPECIFIC ===');
    const [meshShorts] = await connection.execute(`
        SELECT product_id, productname, sizes, total_available_stock 
        FROM products 
        WHERE productname LIKE '%Lightning Mesh%' OR productname LIKE '%Mesh%'
        LIMIT 2
    `);
    
    meshShorts.forEach(product => {
        console.log(`${product.productname} (ID: ${product.product_id})`);
        console.log(`Total stock: ${product.total_available_stock}`);
        if (product.sizes) {
            try {
                const sizes = JSON.parse(product.sizes);
                console.log('Sizes JSON:', JSON.stringify(sizes, null, 2));
            } catch (e) {
                console.log('Invalid sizes JSON');
            }
        }
        console.log('---');
    });
    
    // Check variants for mesh shorts
    const [meshVariants] = await connection.execute(`
        SELECT pv.* 
        FROM product_variants pv
        JOIN products p ON pv.product_id = p.product_id
        WHERE p.productname LIKE '%Lightning Mesh%' OR p.productname LIKE '%Mesh%'
    `);
    
    console.log('=== MESH SHORTS VARIANTS ===');
    meshVariants.forEach(variant => {
        console.log(`ID ${variant.product_id}: ${variant.size} ${variant.color} - Available: ${variant.available_quantity}, Stock: ${variant.stock_quantity}`);
    });
    
    await connection.end();
}

checkDataStructure().catch(console.error);
