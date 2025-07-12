const axios = require('axios');

async function testCustomMarkReceivedDirect() {
    console.log('=== TESTING CUSTOM ORDER MARK-RECEIVED ENDPOINT DIRECTLY ===');
    
    const customOrderId = 'CUSTOM-MCSNSHEW-E616P';
    const endpoint = `http://localhost:5000/api/custom-orders/${customOrderId}/mark-received`;
    
    console.log('🧪 Testing endpoint:', endpoint);
    
    try {
        const response = await axios.post(endpoint, {}, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 5000
        });
        
        console.log('✅ Response received:', response.status, response.data);
    } catch (error) {
        if (error.response) {
            console.log(`📋 Status: ${error.response.status} - ${error.response.statusText}`);
            console.log('Response headers:', error.response.headers);
            console.log('Response data preview:', error.response.data?.toString().substring(0, 200));
            
            if (error.response.status === 401) {
                console.log('✅ Endpoint found! 401 means it requires authentication (expected)');
            } else if (error.response.status === 404) {
                console.log('❌ 404 - Endpoint not found! This is the issue.');
                console.log('Full response:', error.response.data);
            } else {
                console.log('📋 Endpoint found but returned different status');
            }
        } else if (error.code === 'ECONNREFUSED') {
            console.log('❌ Cannot connect to server. Make sure server is running on port 5000');
        } else if (error.code === 'TIMEOUT') {
            console.log('❌ Request timed out');
        } else {
            console.log('❌ Request error:', error.message);
        }
    }
}

testCustomMarkReceivedDirect();
