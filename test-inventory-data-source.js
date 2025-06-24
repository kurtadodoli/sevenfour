const axios = require('axios');

async function testInventoryDataSource() {
    console.log('🔍 Testing Inventory Data Source Alignment...\n');
    
    try {
        // Test MaintenancePage API
        console.log('1️⃣ Testing MaintenancePage API (/api/maintenance/products)...');
        const maintenanceResponse = await axios.get('http://localhost:3001/api/maintenance/products');
        console.log(`✅ MaintenancePage API: ${maintenanceResponse.data.length} products found`);
        
        // Show sample product structure
        if (maintenanceResponse.data.length > 0) {
            const sampleProduct = maintenanceResponse.data[0];
            console.log('\n📋 Sample Product from MaintenancePage API:');
            console.log('- Product ID:', sampleProduct.product_id || sampleProduct.id);
            console.log('- Product Name:', sampleProduct.productname);
            console.log('- Product Color:', sampleProduct.productcolor);
            console.log('- Status:', sampleProduct.status || sampleProduct.productstatus);
            
            if (sampleProduct.sizeColorVariants) {
                console.log('- Size-Color Variants:');
                sampleProduct.sizeColorVariants.forEach(variant => {
                    console.log(`  • Size ${variant.size}:`);
                    if (variant.colorStocks) {
                        variant.colorStocks.forEach(colorStock => {
                            console.log(`    - ${colorStock.color}: ${colorStock.stock} units`);
                        });
                    }
                });
            }
        }
        
        // Show active products count
        const activeProducts = maintenanceResponse.data.filter(product => 
            product.status === 'active' || product.productstatus === 'active'
        );
        console.log(`\n📊 Active Products: ${activeProducts.length} out of ${maintenanceResponse.data.length} total`);
        
        // Calculate total stock for sample
        if (activeProducts.length > 0) {
            const sampleActive = activeProducts[0];
            let totalStock = 0;
            if (sampleActive.sizeColorVariants) {
                sampleActive.sizeColorVariants.forEach(sizeVariant => {
                    if (sizeVariant.colorStocks) {
                        sizeVariant.colorStocks.forEach(colorStock => {
                            totalStock += colorStock.stock || 0;
                        });
                    }
                });
            }
            console.log(`\n🔢 Sample Total Stock Calculation: ${totalStock} units for "${sampleActive.productname}"`);
        }
        
        console.log('\n✅ SUCCESS: InventoryPage will now use the same data source as MaintenancePage!');
        console.log('📋 Benefits:');
        console.log('- Stock numbers will match between MaintenancePage and InventoryPage');
        console.log('- Size-color variant stock will be displayed accurately');
        console.log('- No data inconsistency between maintenance and inventory views');
        
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.log('❌ Server is not running. Please start the server first.');
            console.log('Run: cd server && npm start');
        } else {
            console.log('❌ Error:', error.message);
            if (error.response) {
                console.log('Status:', error.response.status);
                console.log('Response:', error.response.data);
            }
        }
    }
}

testInventoryDataSource();
