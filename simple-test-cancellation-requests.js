// Simple test to verify the GET cancellation-requests endpoint works
const axios = require('axios');

async function testCancellationRequestsEndpoint() {
    console.log('🧪 Testing GET /cancellation-requests endpoint...');
    
    try {
        // Step 1: Login
        console.log('🔑 Logging in...');
        const loginResponse = await axios.post('http://localhost:5000/api/users/login', {
            email: 'krutadodoli@gmail.com',
            password: 'NewAdmin123!'
        });
        
        console.log('✅ Login successful!');
        console.log('User:', loginResponse.data.user.username);
        console.log('Role:', loginResponse.data.user.role);
        
        const token = loginResponse.data.token;
        
        // Step 2: Test GET endpoint
        console.log('\n📋 Testing GET /cancellation-requests...');
        const response = await axios.get('http://localhost:5000/api/custom-orders/cancellation-requests', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('✅ GET endpoint works!');
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.error('❌ Test failed:');
        console.error('Status:', error.response?.status);
        console.error('Response:', error.response?.data);
        console.error('Message:', error.message);
    }
}

testCancellationRequestsEndpoint();
