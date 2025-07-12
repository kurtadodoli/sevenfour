// Test script to verify the payment verification endpoint
const axios = require('axios');

async function testPaymentVerification() {
  try {
    console.log('🧪 Testing payment verification endpoint...');
    
    // Test with proper request body
    const response = await axios.put('http://localhost:5000/api/orders/6/payment-verification', {
      status: 'verified'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OTY3NTAyMzIxMzM1MjE4LCJlbWFpbCI6ImtydXRhZG9kb2xpQGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTczNjE5MTU3MCwiZXhwIjoxNzM2Nzk2MzcwfQ.zGI6dAGNHyMdRvzaDe7G7vyRNMHzNfTpqo4iL3lKrXA'
      }
    });
    
    console.log('✅ Success:', response.data);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testPaymentVerification();
