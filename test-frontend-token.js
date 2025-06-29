const axios = require('axios');

async function testFrontendToken() {
  try {
    console.log('🔍 Testing if authentication is working...');
    
    // Let's check what tokens might be in a typical browser session
    // First, let's try to verify if there's a valid token scenario
    
    // Try to login and get a fresh token
    console.log('🔑 Attempting to get a fresh admin token...');
    
    try {
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
      
      const token = loginResponse.data.token;
      console.log('✅ Got fresh token');
      
      // Test the verify endpoint
      console.log('🔍 Testing token verification...');
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
      
      console.log('✅ Token verification successful:', verifyResponse.data);
      
      // Now test the problematic API endpoint
      console.log('🧪 Testing custom orders endpoint with valid token...');
      
      // Get a test order
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
      
      const updateResponse = await axios.patch(
        `http://localhost:5000/api/custom-orders/${testOrder.id}/delivery-status`,
        {
          delivery_status: 'scheduled',
          delivery_date: null,
          delivery_notes: 'Test update with valid token'
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 5000
        }
      );
      
      console.log('✅ API update successful!');
      console.log('Response:', updateResponse.data);
      
      console.log('\n🎯 CONCLUSION: Authentication and API work fine with valid token');
      console.log('🔍 The issue is likely that the frontend doesn\'t have a valid token in localStorage');
      console.log('💡 Solution: User needs to log in properly to get a valid token');
      
    } catch (loginError) {
      console.log('❌ Login failed:', loginError.response?.data?.message || loginError.message);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testFrontendToken();
