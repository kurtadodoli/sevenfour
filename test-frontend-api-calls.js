// Test script to verify frontend API calls
const axios = require('axios');

async function testFrontendAPICalls() {
  console.log('🧪 Testing Frontend API Calls...\n');
  
  const baseURL = 'http://localhost:5000';
  
  const tests = [
    {
      name: 'Enhanced Delivery Orders',
      url: `${baseURL}/api/delivery-enhanced/orders`,
      method: 'GET'
    },
    {
      name: 'Enhanced Delivery Calendar',
      url: `${baseURL}/api/delivery-enhanced/calendar`,
      method: 'GET',
      params: { year: 2025, month: 1 }
    },
    {
      name: 'Couriers',
      url: `${baseURL}/api/couriers`,
      method: 'GET'
    }
  ];
  
  for (const test of tests) {
    try {
      console.log(`🔍 Testing: ${test.name}`);
      
      const config = {
        method: test.method,
        url: test.url
      };
      
      if (test.params) {
        config.params = test.params;
      }
      
      const response = await axios(config);
      
      console.log(`  ✅ Status: ${response.status}`);
      console.log(`  📊 Data Type: ${typeof response.data}`);
      
      if (response.data && response.data.success !== undefined) {
        console.log(`  🎯 Success: ${response.data.success}`);
        if (Array.isArray(response.data.data)) {
          console.log(`  📋 Items Count: ${response.data.data.length}`);
        } else if (response.data.data) {
          console.log(`  📋 Data Keys: ${Object.keys(response.data.data).join(', ')}`);
        }
      } else if (Array.isArray(response.data)) {
        console.log(`  📋 Items Count: ${response.data.length}`);
      }
      
      console.log('');
      
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
      if (error.response) {
        console.log(`  📋 Status: ${error.response.status}`);
        console.log(`  📋 Data: ${JSON.stringify(error.response.data, null, 2)}`);
      }
      console.log('');
    }
  }
}

testFrontendAPICalls();
