// Check the actual current status of the custom order
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

async function checkCurrentStatus() {
  try {
    console.log('🔍 Checking current status of CUSTOM-MCNQQ7NW-GQEOI...');
    
    // Get the latest data from the API
    const response = await api.get('/delivery-enhanced/orders');
    
    if (response.data.success) {
      const orders = response.data.data;
      const targetOrder = orders.find(o => o.order_number === 'CUSTOM-MCNQQ7NW-GQEOI');
      
      if (targetOrder) {
        console.log('\n📋 Current Order Status:');
        console.log(`   Order Number: ${targetOrder.order_number}`);
        console.log(`   ID: ${targetOrder.id}`);
        console.log(`   Customer: ${targetOrder.customer_name}`);
        console.log(`   Order Status: ${targetOrder.status}`);
        console.log(`   Delivery Status: ${targetOrder.delivery_status}`);
        console.log(`   Updated At: ${targetOrder.updated_at}`);
        
        // The frontend shows "Status: CONFIRMED" which is likely the order status, not delivery status
        console.log('\n🔍 Analysis:');
        console.log(`   The UI shows "Status: CONFIRMED" - this appears to be order.status: ${targetOrder.status}`);
        console.log(`   The delivery status is: ${targetOrder.delivery_status}`);
        console.log('   The action buttons should change the delivery_status, not the order status');
        
        if (targetOrder.delivery_status === 'delivered') {
          console.log('\n✅ SUCCESS: Delivery status was updated correctly to "delivered"');
          console.log('💡 The UI issue might be:');
          console.log('   1. Frontend is showing order.status instead of order.delivery_status');
          console.log('   2. Frontend cache needs refresh');
          console.log('   3. Page needs to be refreshed');
        } else {
          console.log('\n❌ The delivery status was not updated correctly');
        }
        
      } else {
        console.log('❌ Order CUSTOM-MCNQQ7NW-GQEOI not found in API response');
      }
      
    } else {
      console.log('❌ API error:', response.data.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

checkCurrentStatus();
