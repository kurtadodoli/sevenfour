const axios = require('axios');

async function testRouteIssue() {
    console.log('🔍 Testing route precedence issue...\n');
    
    try {
        // Login first
        const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
            email: 'kurtadodoli@gmail.com',
            password: 'password123'
        });
        
        const token = loginResponse.data.data.token;
        console.log('✅ Got token');
        
        // Test with different endpoints to see which route is being hit
        console.log('\n🔍 Testing different paths...');
        
        // Test: /api/custom-orders/test (should work if it exists)
        try {
            const testResponse = await axios.get('http://localhost:3001/api/custom-orders/test');
            console.log('✅ /test endpoint works');
        } catch (error) {
            console.log('❌ /test endpoint:', error.response?.status || error.message);
        }
        
        // Test: /api/custom-orders/my-orders (this should be treated as :customOrderId = "my-orders")
        try {
            const myOrdersResponse = await axios.get('http://localhost:3001/api/custom-orders/my-orders', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log('✅ /my-orders endpoint works');
        } catch (error) {
            console.log('❌ /my-orders endpoint:', error.response?.status, error.response?.data?.message || error.message);
        }
        
        // Test: /api/custom-orders/CUSTOM-MC7WG83W-DGJ38 (an actual order ID)
        try {
            const orderResponse = await axios.get('http://localhost:3001/api/custom-orders/CUSTOM-MC7WG83W-DGJ38', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log('✅ Specific order endpoint works');
        } catch (error) {
            console.log('❌ Specific order endpoint:', error.response?.status, error.response?.data?.message || error.message);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testRouteIssue();
