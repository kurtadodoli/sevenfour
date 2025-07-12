// Test script to simulate the exact frontend request with authentication
const axios = require('axios');

async function testWithAuthentication() {
    try {
        console.log('Testing custom order cancellation with authentication...');
        
        // First, let's try to login to get a valid token
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'test@example.com', // Replace with actual test user
            password: 'password123'
        });
        
        console.log('Login successful, token obtained');
        const token = loginResponse.data.token;
        
        // Now test the cancellation request with the token
        const testData = {
            customOrderId: 'CUSTOM-123', // Replace with actual custom order ID
            reason: 'Test cancellation reason'
        };
        
        console.log('Sending cancellation request with data:', JSON.stringify(testData, null, 2));
        
        const response = await axios.post('http://localhost:5000/api/custom-orders/cancellation-requests', testData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('✅ Success! Response:', response.data);
        
    } catch (error) {
        console.error('Error Details:');
        console.error('Status:', error.response?.status);
        console.error('Status Text:', error.response?.statusText);
        console.error('Response Data:', JSON.stringify(error.response?.data, null, 2));
        console.error('Full Error:', error.message);
        
        // If login failed, try without login (just to see the exact error)
        if (error.response?.status === 401 || error.message.includes('login')) {
            console.log('\n🔍 Testing without authentication to see the exact error...');
            try {
                const testData = {
                    customOrderId: 'CUSTOM-123',
                    reason: 'Test cancellation reason'
                };
                
                const response = await axios.post('http://localhost:5000/api/custom-orders/cancellation-requests', testData, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
            } catch (unAuthError) {
                console.error('Unauthenticated error:', unAuthError.response?.status, unAuthError.response?.data);
            }
        }
    }
}

testWithAuthentication();
