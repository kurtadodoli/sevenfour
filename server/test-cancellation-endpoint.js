const axios = require('axios');

// Test the custom order cancellation endpoint
async function testCancellationEndpoint() {
  try {
    console.log('Testing custom order cancellation endpoint...');
    
    // First, let's test without authentication to see the error
    const response = await axios.post('http://localhost:5000/api/custom-orders/cancellation-requests', {
      customOrderId: 'CUSTOM-TEST-123',
      reason: 'Test cancellation request'
    });
    
    console.log('Response:', response.data);
    
  } catch (error) {
    console.log('Expected error (no auth):', error.response?.data);
    console.log('Status:', error.response?.status);
  }
}

testCancellationEndpoint();
