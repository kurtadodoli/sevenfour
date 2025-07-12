// Debug script to test custom order cancellation request creation
const axios = require('axios');

async function testCancellationRequest() {
    try {
        console.log('Testing custom order cancellation request...');
        
        // Test data - using a smaller user ID to avoid the bigint issue
        const testData = {
            customOrderId: 1, // Using a simple integer
            reason: 'Test cancellation reason',
            additionalInfo: 'Test additional info'
        };
        
        console.log('Sending request with data:', JSON.stringify(testData, null, 2));
        
        const response = await axios.post('http://localhost:5000/api/custom-orders/cancellation-requests', testData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer fake-token' // You might need a real token
            }
        });
        
        console.log('Success! Response:', response.data);
        
    } catch (error) {
        console.error('Error Details:');
        console.error('Status:', error.response?.status);
        console.error('Status Text:', error.response?.statusText);
        console.error('Response Data:', JSON.stringify(error.response?.data, null, 2));
        console.error('Full Error:', error.message);
        
        if (error.response?.data?.error) {
            console.error('Backend Error:', error.response.data.error);
        }
        
        if (error.response?.data?.details) {
            console.error('Error Details:', error.response.data.details);
        }
    }
}

testCancellationRequest();
