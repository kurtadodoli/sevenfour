/**
 * Test inventory API on port 3000
 */

const http = require('http');

console.log('🧪 Testing Inventory API on port 3000...\n');

function testInventoryAPI() {
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/inventory/overview-test',
        method: 'GET'
    };

    const req = http.request(options, (res) => {
        console.log(`✅ API Response: ${res.statusCode} ${res.statusMessage}`);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            try {
                const jsonData = JSON.parse(data);
                
                if (jsonData.success && jsonData.data) {
                    console.log(`📦 Found ${jsonData.data.length} products`);
                    console.log('\n🔍 Sample products:');
                    
                    jsonData.data.slice(0, 3).forEach(product => {
                        console.log(`  📌 ${product.productname}: ${product.totalStock} units (${product.stockLevel})`);
                    });
                    
                    console.log('\n🎉 SUCCESS: Inventory API working on port 3000!');
                    console.log('🌐 Your InventoryPage should now work with port 3000!');
                    
                } else {
                    console.log('⚠️  Unexpected API response format');
                }
                
            } catch (error) {
                console.log('❌ Error parsing JSON response:', error.message);
            }
        });
    });

    req.on('error', (error) => {
        console.log('❌ Request failed:', error.message);
        console.log('Make sure server is running on port 3000');
    });

    req.end();
}

testInventoryAPI();
