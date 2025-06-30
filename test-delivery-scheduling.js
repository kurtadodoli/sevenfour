// Test delivery scheduling endpoint
const axios = require('axios');

async function testDeliveryScheduling() {
  console.log('📦 Testing delivery scheduling endpoint...\n');

  try {
    // First, get a valid token
    console.log('1️⃣ Getting authentication token...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'testadmin@example.com',
      password: 'admin123'
    });

    if (!loginResponse.data.success) {
      throw new Error('Login failed');
    }

    const token = loginResponse.data.data.token;
    console.log('✅ Token obtained');

    // Test the delivery scheduling endpoint
    console.log('\n2️⃣ Testing delivery scheduling endpoint...');
    
    const scheduleData = {
      order_id: 1, // Test with a simple order ID
      order_type: 'regular',
      customer_name: 'Test Customer',
      customer_email: 'test@example.com',
      delivery_date: '2025-01-15',
      delivery_time_slot: '9:00 AM - 12:00 PM',
      delivery_address: '123 Test Street, Test City',
      delivery_notes: 'Test delivery scheduling'
    };

    console.log('📋 Scheduling data:', scheduleData);

    try {
      const scheduleResponse = await axios.post('http://localhost:5000/api/delivery-enhanced/schedule', scheduleData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      console.log('✅ Delivery scheduling successful!');
      console.log('📋 Response:', scheduleResponse.data);

    } catch (scheduleError) {
      console.log('❌ Delivery scheduling failed!');
      console.log('Status:', scheduleError.response?.status);
      console.log('Error:', scheduleError.response?.data);
      
      if (scheduleError.response?.status === 500) {
        console.log('\n🔍 500 Error Details:');
        console.log('This is likely a server-side error in the delivery controller');
        console.log('Common causes:');
        console.log('- Missing required database fields');
        console.log('- Order not found in database');
        console.log('- Database connection issues');
        console.log('- Missing calendar entry');
      }
    }

    // Also test without authentication
    console.log('\n3️⃣ Testing without authentication...');
    try {
      await axios.post('http://localhost:5000/api/delivery-enhanced/schedule', scheduleData);
      console.log('✅ No auth required (as expected for testing)');
    } catch (noAuthError) {
      console.log('❌ Auth required or other error:', noAuthError.response?.status);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testDeliveryScheduling();
