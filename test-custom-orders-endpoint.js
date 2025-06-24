const axios = require('axios');

async function testCustomOrdersEndpoint() {
    console.log('🔍 Testing Custom Orders Endpoint...\n');
    
    try {
        // First, login to get token
        const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
            email: 'kurtadodoli@gmail.com',
            password: 'password123'
        });
        
        const token = loginResponse.data.data.token;
        console.log('✅ Got token:', token.substring(0, 50) + '...');
        
        // Test custom orders endpoint
        console.log('\n🔍 Testing /api/custom-orders/my-orders...');
        try {
            const response = await axios.get('http://localhost:3001/api/custom-orders/my-orders', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('✅ Custom orders endpoint successful!');
            console.log('Response:', JSON.stringify(response.data, null, 2));
        } catch (customError) {
            console.log('❌ Custom orders endpoint failed');
            console.log('Status:', customError.response?.status);
            console.log('Status Text:', customError.response?.statusText);
            console.log('Error data:', JSON.stringify(customError.response?.data, null, 2));
            console.log('Error message:', customError.message);
        }
        
        // Test user designs endpoint
        console.log('\n🔍 Testing /api/user-designs/...');
        try {
            const response = await axios.get('http://localhost:3001/api/user-designs/kurtadodoli%40gmail.com', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('✅ User designs endpoint successful!');
            console.log('Response:', JSON.stringify(response.data, null, 2));
        } catch (userDesignsError) {
            console.log('❌ User designs endpoint failed');
            console.log('Status:', userDesignsError.response?.status);
            console.log('Error data:', JSON.stringify(userDesignsError.response?.data, null, 2));
        }
        
    } catch (error) {
        console.log('❌ Login failed:', error.response?.data || error.message);
    }
}

testCustomOrdersEndpoint();
