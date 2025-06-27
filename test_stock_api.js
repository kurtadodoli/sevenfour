const fetch = require('node-fetch');

async function testStockAPI() {
    try {
        console.log('=== TESTING STOCK API ENDPOINTS ===');
        
        // Test the products API endpoint
        console.log('\n1. Testing /api/products endpoint...');
        const productsResponse = await fetch('http://localhost:5000/api/products');
        const productsData = await productsResponse.json();
        
        if (productsData.success) {
            const striveForward = productsData.data.find(p => p.product_id == 640009057958);
            if (striveForward) {
                console.log('Strive Forward from /api/products:');
                console.log(`  Total Stock: ${striveForward.total_stock}`);
                console.log(`  Total Available: ${striveForward.total_available_stock}`);
                console.log(`  Total Reserved: ${striveForward.total_reserved_stock}`);
                console.log(`  Status: ${striveForward.stock_status}`);
                console.log(`  Sizes: ${striveForward.sizes}`);
            } else {
                console.log('Strive Forward not found in products API');
            }
        } else {
            console.log('Products API error:', productsData.message);
        }
        
        // Test the specific product API endpoint
        console.log('\n2. Testing /api/products/640009057958 endpoint...');
        const productResponse = await fetch('http://localhost:5000/api/products/640009057958');
        const productData = await productResponse.json();
        
        if (productData.success) {
            const product = productData.data;
            console.log('Strive Forward from /api/products/640009057958:');
            console.log(`  Total Stock: ${product.total_stock}`);
            console.log(`  Total Available: ${product.total_available_stock}`);
            console.log(`  Total Reserved: ${product.total_reserved_stock}`);
            console.log(`  Status: ${product.stock_status}`);
            console.log(`  Sizes: ${product.sizes}`);
        } else {
            console.log('Product detail API error:', productData.message);
        }
        
        // Test inventory API if it exists
        console.log('\n3. Testing /api/inventory endpoint...');
        try {
            const inventoryResponse = await fetch('http://localhost:5000/api/inventory');
            const inventoryData = await inventoryResponse.json();
            
            if (inventoryData.success) {
                const striveForwardInv = inventoryData.data.find(p => p.product_id == 640009057958);
                if (striveForwardInv) {
                    console.log('Strive Forward from /api/inventory:');
                    console.log(`  Total Stock: ${striveForwardInv.total_stock}`);
                    console.log(`  Total Available: ${striveForwardInv.total_available_stock}`);
                    console.log(`  Total Reserved: ${striveForwardInv.total_reserved_stock}`);
                    console.log(`  Status: ${striveForwardInv.stock_status}`);
                }
            } else {
                console.log('Inventory API error:', inventoryData.message);
            }
        } catch (invError) {
            console.log('Inventory API not available or error:', invError.message);
        }
        
    } catch (error) {
        console.error('Error testing APIs:', error);
    }
}

testStockAPI().catch(console.error);
