/**
 * Verification script to test the inventory fix
 * This script will:
 * 1. Test the inventory API endpoint
 * 2. Compare with direct database query
 * 3. Verify the data matches what MaintenancePage should show
 */

const mysql = require('mysql2/promise');

async function testInventoryFix() {
    console.log('🔍 Testing Inventory Fix...\n');
    
    try {
        // Test 1: Direct database query
        console.log('1. Testing direct database query...');        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 's3v3n-f0ur-cl0thing*',
            database: 'seven_four_clothing'
        });        // Get products with their stock from product_stock table
        const [products] = await connection.execute(`
            SELECT 
                p.product_id as id,
                p.productname as name,
                p.productprice as price,
                p.productimage as image,
                p.productstatus as status,
                COALESCE(SUM(ps.stock_quantity), 0) as total_stock
            FROM products p
            LEFT JOIN product_stock ps ON p.product_id = ps.product_id
            WHERE (p.productstatus = 'active' OR p.status = 'active')
            GROUP BY p.product_id, p.productname, p.productprice, p.productimage, p.productstatus
            ORDER BY p.productname
        `);

        console.log('Database products with stock:');
        products.forEach(product => {
            console.log(`  - ${product.name}: ${product.total_stock} units`);
        });        // Get size breakdown for verification
        const [stockDetails] = await connection.execute(`
            SELECT 
                p.productname as product_name,
                ps.size,
                ps.stock_quantity as quantity
            FROM products p
            JOIN product_stock ps ON p.product_id = ps.product_id
            WHERE (p.productstatus = 'active' OR p.status = 'active') AND ps.stock_quantity > 0
            ORDER BY p.productname, ps.size
        `);

        console.log('\nSize breakdown:');
        const sizeBreakdown = {};
        stockDetails.forEach(item => {
            if (!sizeBreakdown[item.product_name]) {
                sizeBreakdown[item.product_name] = [];
            }
            sizeBreakdown[item.product_name].push(`${item.size}: ${item.quantity}`);
        });

        Object.keys(sizeBreakdown).forEach(productName => {
            console.log(`  ${productName}: ${sizeBreakdown[productName].join(', ')}`);
        });

        await connection.end();

        // Test 2: API endpoint (if server is running)
        console.log('\n2. Testing API endpoint...');
        try {
            const fetch = require('node-fetch');
            const response = await fetch('http://localhost:3000/api/inventory/overview-test');
            
            if (response.ok) {
                const apiData = await response.json();
                console.log('API Response successful!');
                console.log('API products with stock:');
                apiData.forEach(product => {
                    console.log(`  - ${product.name}: ${product.totalStock} units`);
                    if (product.sizes && product.sizes.length > 0) {
                        const sizesStr = product.sizes.map(s => `${s.size}: ${s.quantity}`).join(', ');
                        console.log(`    Sizes: ${sizesStr}`);
                    }
                });

                // Verify data consistency
                console.log('\n3. Verifying data consistency...');
                let consistent = true;
                products.forEach(dbProduct => {
                    const apiProduct = apiData.find(ap => ap.name === dbProduct.name);
                    if (!apiProduct) {
                        console.log(`❌ Product "${dbProduct.name}" missing from API`);
                        consistent = false;
                    } else if (apiProduct.totalStock !== dbProduct.total_stock) {
                        console.log(`❌ Stock mismatch for "${dbProduct.name}": DB=${dbProduct.total_stock}, API=${apiProduct.totalStock}`);
                        consistent = false;
                    }
                });

                if (consistent) {
                    console.log('✅ Data consistency verified! Database and API match.');
                } else {
                    console.log('❌ Data inconsistency detected.');
                }

            } else {
                console.log(`API request failed: ${response.status} ${response.statusText}`);
                console.log('Make sure the server is running with: node server.js');
            }
        } catch (apiError) {
            console.log('API test failed - server may not be running');
            console.log('To start server: node server.js');
            console.log('Error:', apiError.message);
        }

        console.log('\n✅ Verification complete!');
        console.log('\nNext steps:');
        console.log('1. Start the server: node server.js');
        console.log('2. Open the browser and navigate to the InventoryPage');
        console.log('3. Verify the stock numbers match the values shown above');
        console.log('4. Compare with MaintenancePage to ensure they show the same data');

    } catch (error) {
        console.error('❌ Verification failed:', error.message);
    }
}

testInventoryFix();
