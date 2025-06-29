// Test script for enhanced delivery API endpoints
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testDeliveryAPI() {
  console.log('🧪 Testing Enhanced Delivery API Endpoints...\n');
  
  try {
    // Test 1: Test delivery-enhanced/orders (without auth - should get 401)
    console.log('1️⃣ Testing /delivery-enhanced/orders (no auth)...');
    try {
      const response = await axios.get(`${API_BASE}/delivery-enhanced/orders`);
      console.log('❌ Expected 401 but got:', response.status);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Correctly returns 401 (Unauthorized) as expected');
      } else {
        console.log('❌ Unexpected error:', error.response?.status || error.message);
      }
    }
    
    // Test 2: Test couriers endpoint (should work without auth)
    console.log('\n2️⃣ Testing /couriers...');
    try {
      const response = await axios.get(`${API_BASE}/couriers`);
      console.log('✅ Couriers endpoint working:', response.status);
      console.log('📊 Response data:', response.data?.length || 0, 'couriers found');
    } catch (error) {
      console.log('❌ Couriers endpoint error:', error.response?.status || error.message);
    }
    
    // Test 3: Test orders confirmed-test endpoint
    console.log('\n3️⃣ Testing /orders/confirmed-test...');
    try {
      const response = await axios.get(`${API_BASE}/orders/confirmed-test`);
      console.log('✅ Confirmed test endpoint working:', response.status);
      console.log('📊 Response data:', response.data);
    } catch (error) {
      console.log('❌ Confirmed test endpoint error:', error.response?.status || error.message);
      if (error.response && error.response.data) {
        console.log('📋 Error details:', error.response.data);
      }
    }
    
    // Test 4: Check server health
    console.log('\n4️⃣ Testing server health...');
    try {
      const response = await axios.get('http://localhost:5000/health');
      console.log('✅ Server health check:', response.status);
      console.log('📊 Health data:', response.data);
    } catch (error) {
      console.log('❌ Health check error:', error.response?.status || error.message);
    }
    
  } catch (error) {
    console.error('🔥 General error during testing:', error.message);
  }
  
  console.log('\n🏁 API Testing Complete!');
}

// Run the test
testDeliveryAPI()
  .then(() => {
    console.log('\n✅ Test script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test script failed:', error.message);
    process.exit(1);
  });
