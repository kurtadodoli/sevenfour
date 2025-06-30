// Test the enhanced delivery API by first registering an admin user
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testWithRegisterAndLogin() {
  console.log('🧪 Testing Enhanced Delivery API with Fresh Admin User...\n');
  
  try {
    // Create a test admin user
    console.log('1️⃣ Creating test admin user...');
    
    const testUser = {
      first_name: 'Test',
      last_name: 'Admin',
      email: 'testdelivery@admin.com',
      password: 'TestAdmin123!',
      role: 'admin'
    };
    
    try {
      const registerResponse = await axios.post(`${API_BASE}/auth/register`, testUser);
      console.log('✅ Admin user created successfully');
    } catch (registerError) {
      if (registerError.response?.status === 400 && registerError.response?.data?.message?.includes('already exists')) {
        console.log('ℹ️ Admin user already exists');
      } else {
        console.log('❌ Failed to create admin user:', registerError.response?.data?.message || registerError.message);
      }
    }
    
    // Login with the test admin user
    console.log('\n2️⃣ Logging in with test admin...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful, token obtained');
    
    // Test the enhanced delivery API
    console.log('\n3️⃣ Testing enhanced delivery API with auth token...');
    const response = await axios.get(`${API_BASE}/delivery-enhanced/orders`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('🎉 SUCCESS! Enhanced delivery API is working!');
    console.log('📊 Status:', response.status);
    console.log('📊 Success:', response.data.success);
    console.log('📊 Orders found:', response.data.data?.length || 0);
    
    if (response.data.data && response.data.data.length > 0) {
      console.log('\n📋 Sample orders:');
      response.data.data.slice(0, 3).forEach(order => {
        console.log(`   ${order.order_type}: ${order.order_number} - ${order.customer_name}`);
      });
    }
    
    console.log('\n✅ The 500 error has been fixed!');
    console.log('🚀 DeliveryPage.js should now work properly when logged in as admin.');
    
  } catch (error) {
    console.error('🔥 Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 500) {
      console.log('\n📋 500 Error Details:');
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
      console.log('\n❌ The 500 error still exists and needs more investigation.');
    }
  }
}

testWithRegisterAndLogin();
