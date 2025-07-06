const axios = require('axios');

async function testCustomOrderScheduling() {
  try {
    console.log('🧪 Testing Custom Order Scheduling Fix');
    console.log('='.repeat(50));
    
    const scheduleData = {
      order_id: 43,
      order_type: 'custom_order',
      delivery_date: '2025-07-28T09:00:00',
      customer_name: 'kurt',
      customer_email: 'krutadodoli@gmail.com',
      customer_phone: '98932439824',
      delivery_address: 'Test Address, Test City, Metro Manila',
      delivery_notes: 'Test scheduling for custom order 43',
      courier_id: 10
    };
    
    console.log('📋 Scheduling data:', scheduleData);
    
    const response = await axios.post('http://localhost:5000/api/delivery-enhanced/schedule', scheduleData);
    
    console.log('✅ Schedule successful!');
    console.log('📋 Response:', response.data);
    
  } catch (error) {
    if (error.response) {
      console.log('❌ Schedule failed with status:', error.response.status);
      console.log('📋 Error response:', error.response.data);
    } else {
      console.log('❌ Network/other error:', error.message);
    }
  }
}

testCustomOrderScheduling();
