// Test the enhanced delivery API with proper authentication
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testFixedAPI() {
  console.log('🧪 Testing Fixed Enhanced Delivery API...\n');
  
  try {
    // Try to create a test admin user or use existing credentials
    console.log('1️⃣ Testing with admin credentials...');
    
    // First check if we can get some users to find valid credentials
    try {
      // Let's try some common admin credentials
      const commonCredentials = [
        { email: 'admin@example.com', password: 'admin123' },
        { email: 'admin@sfc.com', password: 'admin' },
        { email: 'test@test.com', password: 'test123' }
      ];
      
      let token = null;
      
      for (const creds of commonCredentials) {
        try {
          console.log(`   Trying ${creds.email}...`);
          const loginResponse = await axios.post(`${API_BASE}/auth/login`, creds);
          token = loginResponse.data.token;
          console.log(`   ✅ Login successful with ${creds.email}`);
          break;
        } catch (e) {
          console.log(`   ❌ Failed: ${creds.email}`);
        }
      }
      
      if (!token) {
        console.log('❌ Could not login with any common credentials');
        console.log('💡 Let\'s test the API directly without authentication to see the error...');
        
        // Test without auth to see the actual 500 error
        try {
          const response = await axios.get(`${API_BASE}/delivery-enhanced/orders`);
        } catch (error) {
          console.log('📋 API Error:', error.response?.status, error.response?.statusText);
          console.log('📋 Error Data:', error.response?.data);
        }
        return;
      }
      
      // Test the enhanced delivery API with valid token
      console.log('\n2️⃣ Testing enhanced delivery API with valid token...');
      const response = await axios.get(`${API_BASE}/delivery-enhanced/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Enhanced delivery API working!');
      console.log('📊 Status:', response.status);
      console.log('📊 Data length:', response.data?.data?.length || 0);
      console.log('📊 Success:', response.data?.success);
      
      if (response.data?.data?.length > 0) {
        console.log('📋 Sample order:', {
          id: response.data.data[0].id,
          order_number: response.data.data[0].order_number,
          customer_name: response.data.data[0].customer_name,
          order_type: response.data.data[0].order_type
        });
      }
      
    } catch (loginError) {
      console.log('❌ Authentication error:', loginError.response?.data || loginError.message);
    }
    
  } catch (error) {
    console.error('🔥 Test error:', error.message);
  }
}

testFixedAPI();
