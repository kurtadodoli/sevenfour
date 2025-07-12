const axios = require('axios');

async function testMarkReceivedWithAuth() {
    console.log('=== TESTING MARK-RECEIVED WITH AUTHENTICATION ===');
    
    try {
        // Step 1: Login to get auth token
        console.log('🔐 Logging in with user credentials...');
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'admin@test.com',
            password: 'admin123'
        });
        
        if (!loginResponse.data.success) {
            console.log('❌ Login failed:', loginResponse.data.message);
            return;
        }
        
        const token = loginResponse.data.data.token;
        console.log('✅ Login successful, got token');
        console.log('🔍 Token preview:', token ? token.substring(0, 50) + '...' : 'NO TOKEN');
        
        // Step 2: Test the mark-received endpoint
        const customOrderId = 'CUSTOM-MCSNSHEW-E616P';
        const endpoint = `http://localhost:5000/api/custom-orders/${customOrderId}/mark-received`;
        
        console.log('🧪 Testing mark-received endpoint:', endpoint);
        console.log('🔑 Using Authorization header: Bearer ' + (token ? token.substring(0, 20) + '...' : 'NO TOKEN'));
        
        const response = await axios.post(endpoint, {}, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });
        
        console.log('✅ Mark-received successful!');
        console.log('Response:', response.data);
        
    } catch (error) {
        if (error.response) {
            console.log('❌ Error response:');
            console.log('Status:', error.response.status);
            console.log('Data:', error.response.data);
            
            // Log more details for debugging
            if (error.response.status === 500) {
                console.log('🔍 Server error details:');
                console.log('Error message:', error.response.data?.error);
                console.log('Full response:', JSON.stringify(error.response.data, null, 2));
            }
        } else {
            console.log('❌ Request error:', error.message);
        }
    }
}

testMarkReceivedWithAuth();
