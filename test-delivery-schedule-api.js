const axios = require('axios');

async function testDeliveryScheduleCreation() {
  console.log('🧪 Testing delivery schedule creation API...');
  
  const testData = {
    order_id: 123,
    order_type: 'regular',
    customer_id: 1,
    delivery_date: '2025-06-25',
    delivery_time_slot: '9:00-17:00',
    delivery_address: '123 Test Street',
    delivery_city: 'Manila',
    delivery_postal_code: '1000',
    delivery_province: 'Metro Manila',
    delivery_contact_phone: '+63123456789',
    delivery_notes: 'Test delivery schedule',
    priority_level: 'normal',
    delivery_fee: 150.00
  };

  try {
    console.log('📤 Sending request to http://localhost:3001/api/delivery/schedules');
    console.log('📋 Request data:', JSON.stringify(testData, null, 2));
    
    const response = await axios.post('http://localhost:3001/api/delivery/schedules', testData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Success! Response:', response.data);
    
  } catch (error) {
    console.error('❌ Error details:');
    console.error('- Status:', error.response?.status);
    console.error('- Status Text:', error.response?.statusText);
    console.error('- Error Message:', error.message);
    console.error('- Response Data:', error.response?.data);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Connection refused - is the server running on port 3001?');
    }
  }
}

// Also test if we can get existing schedules
async function testGetSchedules() {
  console.log('\n🧪 Testing get delivery schedules API...');
  
  try {
    const response = await axios.get('http://localhost:3001/api/delivery/schedules');
    console.log('✅ Success! Found', response.data.length, 'schedules');
    console.log('📋 First schedule:', response.data[0] || 'No schedules found');
    
  } catch (error) {
    console.error('❌ Error getting schedules:', error.message);
    console.error('- Response Data:', error.response?.data);
  }
}

// Run tests
testGetSchedules().then(() => testDeliveryScheduleCreation());
