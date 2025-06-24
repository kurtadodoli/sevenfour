const axios = require('axios');

async function debugMaintenanceAPI() {
    try {
        console.log('🔍 Debugging MaintenancePage API response...\n');
        
        const response = await axios.get('http://localhost:3001/api/maintenance/products');
        const products = response.data;
        
        console.log(`📦 Found ${products.length} products\n`);
        
        // Show the first few products with their actual structure
        products.slice(0, 3).forEach((product, index) => {
            console.log(`🔍 Product ${index + 1}: ${product.productname}`);
            console.log('📋 Full structure:');
            console.log(JSON.stringify(product, null, 2));
            console.log('---'.repeat(20));
        });
        
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

debugMaintenanceAPI();
