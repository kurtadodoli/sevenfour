/**
 * Test inventory API using built-in http module
 */

const http = require('http');

console.log('🧪 Testing Inventory API...\n');

function testInventoryAPI() {
    const options = {
        hostname: 'localhost',
        port: 5000,
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
                    
                    console.log('\n🎉 SUCCESS: Inventory API is working perfectly!');
                    console.log('🌐 Your InventoryPage should now work!');
                    console.log('Go to your browser and refresh the InventoryPage.');
                    
                } else {
                    console.log('⚠️  Unexpected API response format');
                    console.log('Data preview:', data.substring(0, 200));
                }
                
            } catch (error) {
                console.log('❌ Error parsing JSON response:', error.message);
                console.log('Raw response:', data.substring(0, 200));
            }
        });
    });

    req.on('error', (error) => {
        console.log('❌ Request failed:', error.message);
        console.log('\n🔧 This could mean:');
        console.log('- Server is not running on port 5000');
        console.log('- API endpoint is not available');
        console.log('- Network connectivity issue');
    });

    req.end();
}

testInventoryAPI();
