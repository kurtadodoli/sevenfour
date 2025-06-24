const axios = require('axios');

async function testInventoryAPI() {
    try {
        console.log('🔍 Testing Inventory API...\n');
        
        // Test the inventory overview endpoint
        const response = await axios.get('http://localhost:3001/api/inventory/overview-test');
        const result = response.data;
        
        console.log('✅ Inventory API Response:');
        console.log(`- Success: ${result.success}`);
        console.log(`- Message: ${result.message}`);
        console.log(`- Products Count: ${result.data?.length || 0}\n`);
        
        if (result.data && result.data.length > 0) {
            console.log('📦 Sample Products:');
            result.data.slice(0, 5).forEach(product => {
                console.log(`\n${product.productname}:`);
                console.log(`  - Total Stock: ${product.totalStock} units`);
                console.log(`  - Stock Level: ${product.stockLevel}`);
                console.log(`  - DB Total Stock: ${product.db_total_stock}`);
                
                if (product.sizes) {
                    try {
                        const sizes = JSON.parse(product.sizes);
                        console.log('  - Size Breakdown:');
                        sizes.forEach(size => {
                            console.log(`    • ${size.size}: ${size.stock} units`);
                        });
                    } catch (e) {
                        console.log('  - Sizes: Could not parse');
                    }
                }
            });
            
            // Check for products with actual stock
            const withStock = result.data.filter(p => p.totalStock > 0);
            const withoutStock = result.data.filter(p => p.totalStock === 0);
            
            console.log(`\n📊 Stock Summary:`);
            console.log(`- Products with stock: ${withStock.length}`);
            console.log(`- Products without stock: ${withoutStock.length}`);
            console.log(`- Total products: ${result.data.length}`);
            
            if (withStock.length > 0) {
                console.log('\n✅ SUCCESS: Some products have stock data!');
                console.log('Products with stock:');
                withStock.forEach(p => {
                    console.log(`  - ${p.productname}: ${p.totalStock} units (${p.stockLevel})`);
                });
            } else {
                console.log('\n❌ ISSUE: No products have stock data');
            }
        }
        
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.log('❌ Server is not running. Please start the server first.');
        } else {
            console.log('❌ Error:', error.message);
            if (error.response) {
                console.log('Status:', error.response.status);
                console.log('Response:', error.response.data);
            }
        }
    }
}

testInventoryAPI();
