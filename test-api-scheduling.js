const axios = require('axios');

async function testDeliverySchedulingAPI() {
  try {
    console.log('🧪 Testing delivery scheduling API...');
    
    // Test with a simple payload
    const testPayload = {
      order_id: 1, // Assuming there's an order with ID 1
      order_type: 'regular',
      delivery_date: '2025-07-15', // Future date
      delivery_time_slot: '10:00-12:00',
      delivery_notes: 'Test delivery from API',
      priority_level: 'normal'
    };
    
    console.log('📤 Sending request:', testPayload);
    
    const response = await axios.post('http://localhost:5000/api/delivery-enhanced/schedule', testPayload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ API Response:', response.data);
    
  } catch (error) {
    console.error('❌ API Error:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

testDeliverySchedulingAPI();
