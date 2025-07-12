// Test exact browser request for custom order cancellation
const axios = require('axios');

// Mock a user token for testing (we'll need to check auth middleware)
const testUserToken = 'test-token-123';

async function testCancellationRequest() {
    try {
        console.log('Testing custom order cancellation request...');
        
        // Use one of the existing custom orders
        const testData = {
            customOrderId: 'CUSTOM-MCSS0ZFM-7LW55', // From the database query
            reason: 'Test cancellation reason - changed my mind'
        };
        
        console.log('Sending request with data:', JSON.stringify(testData, null, 2));
        
        const response = await axios.post('http://localhost:5000/api/custom-orders/cancellation-requests', testData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${testUserToken}`
            }
        });
        
        console.log('✅ Success! Response:', response.data);
        
    } catch (error) {
        console.error('❌ Error Details:');
        console.error('Status:', error.response?.status);
        console.error('Status Text:', error.response?.statusText);
        console.error('Response Data:', JSON.stringify(error.response?.data, null, 2));
        console.error('Full Error:', error.message);
        
        // If it's a 401 error, let's test without token to see the specific 500 error
        if (error.response?.status === 401) {
            console.log('\n🔍 Testing without auth to see if there\'s a 500 error...');
            try {
                const testData = {
                    customOrderId: 'CUSTOM-MCSS0ZFM-7LW55',
                    reason: 'Test cancellation reason'
                };
                
                await axios.post('http://localhost:5000/api/custom-orders/cancellation-requests', testData, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
            } catch (unAuthError) {
                console.error('Unauthenticated error status:', unAuthError.response?.status);
                console.error('Unauthenticated error data:', JSON.stringify(unAuthError.response?.data, null, 2));
            }
        }
    }
}

testCancellationRequest();
