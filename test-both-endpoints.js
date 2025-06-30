const axios = require('axios');

async function testScheduleEndpoint() {
  try {
    console.log('🧪 Testing test schedule endpoint...');
    
    const testPayload = {
      order_id: 1,
      order_type: 'regular',
      delivery_date: '2025-07-15',
      delivery_time_slot: '10:00-12:00',
      delivery_notes: 'Test delivery',
      priority_level: 'normal'
    };
    
    console.log('📤 Testing /api/test-schedule');
    const response = await axios.post('http://localhost:5000/api/test-schedule', testPayload, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('✅ Test schedule response:', response.data);
    
    console.log('\n📤 Testing /api/delivery-enhanced/schedule');
    const response2 = await axios.post('http://localhost:5000/api/delivery-enhanced/schedule', testPayload, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('✅ Enhanced schedule response:', response2.data);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testScheduleEndpoint();
