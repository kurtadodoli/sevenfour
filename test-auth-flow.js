const axios = require('axios');

async function testAuthenticationFlow() {
  try {
    console.log('🔄 Testing authentication flow for delivery status updates...');
    
    // Step 1: Login to get a token
    console.log('\n1️⃣ Step 1: Login to get token...');
    
    const loginResponse = await axios.post(
      'http://localhost:5000/api/auth/login',
      {
        email: 'testadmin@example.com',
        password: 'admin123'
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000
      }
    );
    
    console.log('✅ Login successful');
    console.log('📋 Login response keys:', Object.keys(loginResponse.data));
    console.log('🔑 Token exists:', !!loginResponse.data.data?.token);
    
    if (!loginResponse.data.data?.token) {
      console.log('❌ No token in login response!');
      console.log('Full response:', loginResponse.data);
      return;
    }
    
    const token = loginResponse.data.data.token;
    console.log('🔑 Token (first 50 chars):', token.substring(0, 50) + '...');
    
    // Step 2: Test the verify endpoint
    console.log('\n2️⃣ Step 2: Test token verification...');
    
    try {
      const verifyResponse = await axios.get(
        'http://localhost:5000/api/auth/verify',
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 5000
        }
      );
      
      console.log('✅ Token verification successful');
      console.log('👤 User data:', verifyResponse.data.data.user);
      
    } catch (verifyError) {
      console.log('❌ Token verification failed');
      console.log('Status:', verifyError.response?.status);
      console.log('Error:', verifyError.response?.data);
      
      // This is likely where the issue is
      if (verifyError.response?.status === 401) {
        console.log('\n🔍 DEBUGGING: Authentication middleware is rejecting the token');
        console.log('Let\'s check what the middleware is seeing...');
        
        // Check if it's a Bearer token format issue
        console.log('Authorization header being sent:', `Bearer ${token}`);
        
        return; // Don't continue if verify fails
      }
    }
    
    // Step 3: Test the custom orders endpoint
    console.log('\n3️⃣ Step 3: Test custom orders delivery status update...');
    
    // Get a test order first
    const mysql = require('mysql2/promise');
    const dbConfig = {
      host: 'localhost',
      user: 'root',
      password: 's3v3n-f0ur-cl0thing*',
      database: 'seven_four_clothing'
    };
    
    const connection = await mysql.createConnection(dbConfig);
    const [customOrders] = await connection.execute(`
      SELECT id, custom_order_id, delivery_status 
      FROM custom_orders 
      WHERE status = 'approved' 
      LIMIT 1
    `);
    await connection.end();
    
    if (customOrders.length === 0) {
      console.log('❌ No test orders available');
      return;
    }
    
    const testOrder = customOrders[0];
    console.log('📦 Testing with order:', testOrder.custom_order_id);
    console.log('📦 Current delivery status:', testOrder.delivery_status);
    
    try {
      const updateResponse = await axios.patch(
        `http://localhost:5000/api/custom-orders/${testOrder.id}/delivery-status`,
        {
          delivery_status: 'in_transit',
          delivery_date: null,
          delivery_notes: 'Test update via complete auth flow'
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 5000
        }
      );
      
      console.log('✅ Custom orders API update successful!');
      console.log('📋 Response:', updateResponse.data);
      
      console.log('\n🎉 SUCCESS: Complete authentication flow works!');
      console.log('💡 This means the API endpoints are working correctly.');
      console.log('🔍 The issue is likely in the frontend authentication state.');
      
    } catch (apiError) {
      console.log('❌ Custom orders API call failed');
      console.log('Status:', apiError.response?.status);
      console.log('Error:', apiError.response?.data);
      
      if (apiError.response?.status === 401) {
        console.log('\n🚨 FOUND THE ISSUE: API call authentication failed');
        console.log('🔍 Even though verify works, the API endpoint auth fails');
        console.log('💡 There might be an issue with the custom-orders route auth middleware');
      }
    }
    
  } catch (error) {
    console.error('❌ Flow test error:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    }
  }
}

testAuthenticationFlow();
