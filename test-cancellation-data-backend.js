// Test script to check actual cancellation request data from backend
const axios = require('axios');

const testCancellationData = async () => {
  try {
    const API_BASE_URL = 'http://localhost:8080/api';
    
    // Test regular order cancellation requests
    console.log('🔍 Testing regular order cancellation requests...');
    
    try {
      const regularResponse = await axios.get(`${API_BASE_URL}/orders/cancellation-requests`);
      console.log('✅ Regular order cancellation requests response:');
      console.log('Status:', regularResponse.status);
      console.log('Data structure:', regularResponse.data);
      
      if (regularResponse.data.success && regularResponse.data.data) {
        console.log('📋 Sample regular order cancellation request:');
        console.log(JSON.stringify(regularResponse.data.data[0], null, 2));
        
        // Test the field mapping logic
        if (regularResponse.data.data.length > 0) {
          const request = regularResponse.data.data[0];
          console.log('🔍 Field analysis for regular order:');
          console.log('   - order_number:', request.order_number);
          console.log('   - order_id:', request.order_id);
          console.log('   - transaction_id:', request.transaction_id);
          console.log('   - id:', request.id);
          
          const mappedOrderNumber = request.order_number || request.order_id || request.transaction_id || request.id;
          console.log('   - Final mapped order_number:', mappedOrderNumber);
        }
      }
    } catch (error) {
      console.log('❌ Error fetching regular order cancellation requests:', error.message);
    }
    
    // Test custom order cancellation requests
    console.log('\n🔍 Testing custom order cancellation requests...');
    
    try {
      const customResponse = await axios.get(`${API_BASE_URL}/custom-orders/cancellation-requests`);
      console.log('✅ Custom order cancellation requests response:');
      console.log('Status:', customResponse.status);
      console.log('Data structure:', customResponse.data);
      
      if (customResponse.data.success && customResponse.data.data) {
        console.log('📋 Sample custom order cancellation request:');
        console.log(JSON.stringify(customResponse.data.data[0], null, 2));
        
        if (customResponse.data.data.length > 0) {
          const request = customResponse.data.data[0];
          console.log('🔍 Field analysis for custom order:');
          console.log('   - custom_order_id:', request.custom_order_id);
          console.log('   - order_number:', request.order_number);
          console.log('   - id:', request.id);
          
          const mappedOrderNumber = request.custom_order_id || request.order_number;
          console.log('   - Final mapped order_number:', mappedOrderNumber);
        }
      }
    } catch (error) {
      console.log('❌ Error fetching custom order cancellation requests:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testCancellationData();
