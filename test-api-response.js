// Quick test to see the actual API response
const axios = require('axios');

async function testAPI() {
  try {
    const response = await axios.get('http://localhost:5000/api/delivery-enhanced/orders');
    console.log('✅ API Response Status:', response.status);
    console.log('📊 API Response Data:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ API Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testAPI();
