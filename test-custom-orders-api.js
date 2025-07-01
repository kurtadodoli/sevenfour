const axios = require('axios');

async function testCustomOrdersAPI() {
    try {
        console.log('🧪 Testing custom orders API endpoint...');
        
        // First, let's try without authentication to see the error
        try {
            const response = await axios.get('http://localhost:3000/api/custom-orders/admin/all');
            console.log('✅ API Response (no auth):', response.data);
        } catch (error) {
            console.log('❌ Expected auth error:', error.response?.status, error.response?.data?.message);
        }
        
        // Now let's check what the frontend would get
        console.log('\n🔍 Checking what frontend gets...');
        
        // Try to make a request similar to what the frontend does
        const testUser = {
            email: 'admin@test.com',
            role: 'admin'
        };
        
        // Create a simple auth token for testing (this is just for debugging)
        console.log('ℹ️ To test the API properly, the frontend needs to be authenticated.');
        console.log('Let me check if the server is running and what endpoints are available...');
        
        // Try the base API endpoint
        try {
            const healthCheck = await axios.get('http://localhost:3000/api/test');
            console.log('✅ Server is running, test endpoint response:', healthCheck.data);
        } catch (error) {
            console.log('❌ Server might not be running or endpoint not available');
            console.log('Error:', error.code || error.message);
        }
        
    } catch (error) {
        console.error('❌ Error testing API:', error.message);
    }
}

testCustomOrdersAPI().then(() => {
    console.log('\n✅ API test complete');
    process.exit(0);
}).catch(err => {
    console.error('💥 API test failed:', err);
    process.exit(1);
});
