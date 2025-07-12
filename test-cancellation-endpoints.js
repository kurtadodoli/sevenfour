const axios = require('axios');

// First, let's test the GET endpoint to see current cancellation requests
async function testGetCancellationRequests() {
    try {
        console.log('🔍 Testing GET /api/custom-orders/cancellation-requests...');
        
        const response = await axios.get('http://localhost:5000/api/custom-orders/cancellation-requests');
        console.log('✅ GET request successful');
        console.log('Response:', response.data);
    } catch (error) {
        console.log('❌ GET request failed');
        console.log('Error:', error.response?.data || error.message);
    }
}

// Test the POST endpoint (this will fail due to auth, but we can see the structure)
async function testPostCancellationRequest() {
    try {
        console.log('\\n🔍 Testing POST /api/custom-orders/cancellation-requests...');
        
        const requestData = {
            customOrderId: 'CUSTOM-MCSS0ZFM-7LW55',
            reason: 'Test cancellation request from debugging script'
        };
        
        console.log('Request data:', requestData);
        
        const response = await axios.post('http://localhost:5000/api/custom-orders/cancellation-requests', requestData);
        console.log('✅ POST request successful');
        console.log('Response:', response.data);
    } catch (error) {
        console.log('❌ POST request failed');
        console.log('Status:', error.response?.status);
        console.log('Error:', error.response?.data || error.message);
    }
}

async function runTests() {
    await testGetCancellationRequests();
    await testPostCancellationRequest();
}

runTests();
