const axios = require('axios');

async function testInventoryEndpoint() {
    try {
        console.log('🔍 Testing inventory endpoint...');
        
        // Test without auth first to see if route exists
        const response = await axios.get('http://localhost:3001/api/products/admin/inventory');
        
        console.log('✅ Route is working!');
        console.log('Response:', response.data);
        
    } catch (error) {
        if (error.response) {
            if (error.response.status === 401) {
                console.log('✅ Route exists but requires authentication (expected)');
                console.log('Status:', error.response.status);
                console.log('Message:', error.response.data?.message || 'Unauthorized');
            } else if (error.response.status === 404) {
                console.log('❌ Route still not found (404)');
            } else {
                console.log('⚠️  Route exists but returned:', error.response.status);
                console.log('Response:', error.response.data);
            }
        } else if (error.code === 'ECONNREFUSED') {
            console.log('❌ Server is not running. Please start the server first.');
            console.log('Run: cd server && npm start');
        } else {
            console.log('❌ Error:', error.message);
        }
    }
}

console.log('🚀 Testing inventory route at http://localhost:3001/api/products/admin/inventory');
console.log('Make sure your server is running first!\n');

testInventoryEndpoint();
