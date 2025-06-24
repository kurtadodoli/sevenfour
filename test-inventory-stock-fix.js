const axios = require('axios');

async function testInventoryStockFix() {
    try {
        console.log('🔍 Testing Inventory Stock Fix...\n');
        
        // Get data from maintenance API
        const response = await axios.get('http://localhost:3001/api/maintenance/products');
        const products = response.data;
        
        console.log('📦 Processing products like InventoryPage now does:\n');
        
        // Simulate the same processing as InventoryPage
        const processedProducts = products
          .filter(product => product.status === 'active' || product.productstatus === 'active')
          .map(product => {
            const totalStock = product.total_stock || 0;
            
            let stockLevel = 'normal';
            if (totalStock === 0) {
              stockLevel = 'critical';
            } else if (totalStock <= 10) {
              stockLevel = 'low';
            }
            
            return {
              productname: product.productname,
              totalStock: totalStock,
              stockLevel: stockLevel,
              productcolor: product.productcolor
            };
          });
        
        console.log('✅ Processed Products for InventoryPage:');
        console.log('━'.repeat(80));
        processedProducts.forEach(product => {
            const statusIcon = product.stockLevel === 'critical' ? '🔴' : 
                             product.stockLevel === 'low' ? '🟡' : '🟢';
            console.log(`${statusIcon} ${product.productname}`);
            console.log(`   Stock: ${product.totalStock} units (${product.stockLevel})`);
            console.log(`   Color: ${product.productcolor}`);
            console.log('');
        });
        
        console.log('📊 Summary:');
        const totalProducts = processedProducts.length;
        const criticalStock = processedProducts.filter(p => p.stockLevel === 'critical').length;
        const lowStock = processedProducts.filter(p => p.stockLevel === 'low').length;
        const normalStock = processedProducts.filter(p => p.stockLevel === 'normal').length;
        
        console.log(`Total Active Products: ${totalProducts}`);
        console.log(`🔴 Critical Stock (0 units): ${criticalStock}`);
        console.log(`🟡 Low Stock (1-10 units): ${lowStock}`);
        console.log(`🟢 Normal Stock (11+ units): ${normalStock}`);
        
        console.log('\n✅ InventoryPage should now show correct stock numbers!');
        
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

testInventoryStockFix();
