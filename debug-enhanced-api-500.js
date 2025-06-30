// Test script to debug the enhanced delivery API 500 error
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testWithAuth() {
  console.log('🧪 Testing Enhanced Delivery API with Authentication...\n');
  
  try {
    // First, let's try to login to get a token
    console.log('1️⃣ Attempting to login...');
    
    // Try a test login (you may need to adjust credentials)
    const loginData = {
      email: 'admin@example.com', // Adjust as needed
      password: 'admin123' // Adjust as needed
    };
    
    try {
      const loginResponse = await axios.post(`${API_BASE}/auth/login`, loginData);
      console.log('✅ Login successful');
      const token = loginResponse.data.token;
      
      // Test the enhanced delivery API with auth
      console.log('\n2️⃣ Testing enhanced delivery API with token...');
      const response = await axios.get(`${API_BASE}/delivery-enhanced/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Enhanced delivery API working with auth');
      console.log('📊 Response:', response.data);
      
    } catch (authError) {
      console.log('❌ Login failed, testing API error directly...');
      
      // Test the API without valid auth to see the 500 error
      try {
        const response = await axios.get(`${API_BASE}/delivery-enhanced/orders`, {
          headers: {
            'Authorization': 'Bearer invalid-token',
            'Content-Type': 'application/json'
          }
        });
      } catch (apiError) {
        console.log('📋 API Error Status:', apiError.response?.status);
        console.log('📋 API Error Message:', apiError.response?.statusText);
        console.log('📋 API Error Data:', apiError.response?.data);
        
        if (apiError.response?.status === 500) {
          console.log('🔥 This is the 500 error we need to fix!');
        }
      }
    }
    
  } catch (error) {
    console.error('🔥 Test error:', error.message);
  }
}

// Also test without auth to see what happens
async function testWithoutAuth() {
  console.log('\n3️⃣ Testing API without authentication...');
  try {
    const response = await axios.get(`${API_BASE}/delivery-enhanced/orders`);
    console.log('❌ Expected 401 but got:', response.status);
  } catch (error) {
    console.log('📋 Status:', error.response?.status);
    console.log('📋 Message:', error.response?.data?.message || error.message);
  }
}

testWithAuth().then(() => testWithoutAuth());
