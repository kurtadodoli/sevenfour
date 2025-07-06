// Test the /custom-orders/my-orders API to see if delivery_status is included
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

async function testMyOrdersAPI() {
  try {
    console.log('🧪 Testing /custom-orders/my-orders API...');
    
    // First try without authentication to see the error
    console.log('\n🔓 Testing without authentication...');
    try {
      const response = await api.get('/custom-orders/my-orders');
      console.log('Response:', response.data);
    } catch (error) {
      console.log('❌ Auth required (expected):', error.response?.data?.message);
    }
    
    // The API requires authentication, so the issue might be that
    // the frontend is making the request but the delivery_status isn't being updated
    // Let's check the data structure by calling the enhanced delivery API
    console.log('\n📡 Calling /delivery-enhanced/orders to see custom order structure...');
    const deliveryResponse = await api.get('/delivery-enhanced/orders');
    
    if (deliveryResponse.data.success) {
      const orders = deliveryResponse.data.data;
      const targetOrder = orders.find(o => o.order_number === 'CUSTOM-MCNQQ7NW-GQEOI');
      
      if (targetOrder) {
        console.log('\n📋 Custom Order from Delivery API:');
        console.log(`   Order Number: ${targetOrder.order_number}`);
        console.log(`   Order Status: ${targetOrder.status}`);
        console.log(`   Delivery Status: ${targetOrder.delivery_status}`);
        console.log(`   Full object keys:`, Object.keys(targetOrder));
        
        // The issue might be that OrderPage.js uses a different API
        // that doesn't have the updated delivery_status
        console.log('\n💡 Analysis:');
        console.log('   DeliveryPage.js uses: /delivery-enhanced/orders');
        console.log('   OrderPage.js uses: /custom-orders/my-orders');
        console.log('   These might have different data structures or update timing');
        
      } else {
        console.log('❌ Order not found in delivery API');
      }
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testMyOrdersAPI();
