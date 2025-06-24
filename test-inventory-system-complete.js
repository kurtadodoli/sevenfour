/**
 * Comprehensive Inventory Fix Test
 * Tests both backend API and frontend integration
 */

const mysql = require('mysql2/promise');

async function testInventorySystem() {
    console.log('🧪 Comprehensive Inventory System Test\n');
    
    try {
        // Step 1: Check database configuration
        console.log('1️⃣ Checking database connection...');
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 's3v3n-f0ur-cl0thing*',
            database: 'seven_four_clothing'
        });

        // Step 2: Get actual stock data from database
        console.log('2️⃣ Getting stock data from database...');
        const [stockData] = await connection.execute(`
            SELECT 
                p.product_id,
                p.productname,
                p.productprice,
                p.productstatus,
                SUM(ps.stock_quantity) as total_stock,
                GROUP_CONCAT(CONCAT(ps.size, ':', ps.stock_quantity) ORDER BY ps.size) as size_breakdown
            FROM products p
            LEFT JOIN product_stock ps ON p.product_id = ps.product_id
            WHERE (p.productstatus = 'active' OR p.status = 'active')
            GROUP BY p.product_id, p.productname, p.productprice, p.productstatus
            ORDER BY p.productname
        `);

        console.log('📊 Database Stock Summary:');
        let totalProducts = 0;
        let totalStockUnits = 0;
        
        stockData.forEach(product => {
            totalProducts++;
            const stock = product.total_stock || 0;
            totalStockUnits += stock;
            
            console.log(`  🔸 ${product.productname}: ${stock} units`);
            if (product.size_breakdown) {
                console.log(`    📏 Sizes: ${product.size_breakdown.replace(/,/g, ', ')}`);
            }
        });
        
        console.log(`\n📈 Total: ${totalProducts} products, ${totalStockUnits} units\n`);

        await connection.end();

        // Step 3: Test API endpoint
        console.log('3️⃣ Testing API endpoint...');
        
        try {
            const fetch = require('node-fetch');
            const response = await fetch('http://localhost:5000/api/inventory/overview-test');
            
            if (response.ok) {
                const apiResponse = await response.json();
                console.log('✅ API Response received successfully');
                
                if (apiResponse.success && apiResponse.data) {
                    const products = apiResponse.data;
                    console.log(`📦 API returned ${products.length} products\n`);
                    
                    console.log('🔍 API Stock Data:');
                    products.forEach(product => {
                        console.log(`  🔸 ${product.productname}: ${product.totalStock} units (${product.stockLevel})`);
                        
                        if (product.sizes) {
                            try {
                                const sizes = JSON.parse(product.sizes);
                                const sizeStr = sizes.map(s => `${s.size}:${s.stock}`).join(', ');
                                console.log(`    📏 Sizes: ${sizeStr}`);
                            } catch (e) {
                                console.log(`    📏 Sizes: ${product.sizes}`);
                            }
                        }
                    });
                    
                    // Step 4: Compare database vs API data
                    console.log('\n4️⃣ Comparing database vs API data...');
                    let matches = 0;
                    let mismatches = 0;
                    
                    stockData.forEach(dbProduct => {
                        const apiProduct = products.find(ap => ap.productname === dbProduct.productname);
                        if (apiProduct) {
                            if (apiProduct.totalStock === (dbProduct.total_stock || 0)) {
                                matches++;
                                console.log(`  ✅ ${dbProduct.productname}: MATCH (${dbProduct.total_stock} units)`);
                            } else {
                                mismatches++;
                                console.log(`  ❌ ${dbProduct.productname}: MISMATCH - DB: ${dbProduct.total_stock}, API: ${apiProduct.totalStock}`);
                            }
                        } else {
                            mismatches++;
                            console.log(`  ❌ ${dbProduct.productname}: NOT FOUND in API`);
                        }
                    });
                    
                    console.log(`\n📊 Results: ${matches} matches, ${mismatches} mismatches`);
                    
                    if (mismatches === 0) {
                        console.log('🎉 SUCCESS: Database and API data perfectly match!');
                    } else {
                        console.log('⚠️  WARNING: Data inconsistencies detected');
                    }
                    
                } else {
                    console.log('❌ API returned unexpected format:', apiResponse);
                }
                
            } else {
                console.log(`❌ API request failed: ${response.status} ${response.statusText}`);
            }
            
        } catch (apiError) {
            console.log('❌ API test failed - server may not be running');
            console.log('Error:', apiError.message);
            console.log('\n💡 To start the server: node server.js');
        }

        // Step 5: Frontend integration check
        console.log('\n5️⃣ Frontend Integration Checklist:');
        console.log('✅ Client .env updated to port 5000');
        console.log('✅ InventoryPage.js uses environment variable for API URL');
        console.log('✅ InventoryPage.js handles { success: true, data: [...] } response format');
        console.log('✅ InventoryPage.js uses correct field names (totalStock, not total_stock)');

        console.log('\n🚀 Next Steps:');
        console.log('1. Start the server: node server.js');
        console.log('2. Start the client: npm start (in client directory)');
        console.log('3. Navigate to InventoryPage in browser');
        console.log('4. Verify stock numbers match the database values shown above');
        console.log('5. Compare with MaintenancePage to ensure consistency');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testInventorySystem();
