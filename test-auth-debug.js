// Test authentication flow to debug 401 errors
const axios = require('axios');

async function testAuthFlow() {
  console.log('🔐 Testing authentication flow...\n');

  try {
    // Test 1: Check server health
    console.log('1️⃣ Testing server health...');
    const healthResponse = await axios.get('http://localhost:5000/api/auth/health-check');
    console.log('✅ Server health:', healthResponse.data.message);

    // Test 2: Try to access protected endpoint without token
    console.log('\n2️⃣ Testing protected endpoint without token...');
    try {
      await axios.get('http://localhost:5000/api/auth/profile');
      console.log('❌ This should have failed!');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Protected endpoint correctly rejects missing token');
      } else {
        console.log('❌ Unexpected error:', error.response?.status);
      }
    }

    // Test 3: Try login to get a valid token
    console.log('\n3️⃣ Testing login to get token...');
    try {
      const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'testadmin@example.com',
        password: 'admin123'
      });
      
      if (loginResponse.data.success) {
        console.log('✅ Login successful');
        const token = loginResponse.data.data.token;
        
        // Test 4: Use token to access protected endpoint
        console.log('\n4️⃣ Testing with valid token...');
        const profileResponse = await axios.get('http://localhost:5000/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (profileResponse.data.success) {
          console.log('✅ Token authentication successful');
          console.log('👤 User:', profileResponse.data.data.user.email);
        }

        // Test 5: Test cart endpoint
        console.log('\n5️⃣ Testing cart endpoint...');
        try {
          const cartResponse = await axios.get('http://localhost:5000/api/cart', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          console.log('✅ Cart endpoint accessible');
        } catch (cartError) {
          console.log('❌ Cart endpoint error:', cartError.response?.status, cartError.response?.data?.message);
        }

        // Test 6: Test verify endpoint
        console.log('\n6️⃣ Testing verify endpoint...');
        try {
          const verifyResponse = await axios.get('http://localhost:5000/api/auth/verify', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          console.log('✅ Verify endpoint accessible');
        } catch (verifyError) {
          console.log('❌ Verify endpoint error:', verifyError.response?.status, verifyError.response?.data?.message);
        }

      } else {
        console.log('❌ Login failed:', loginResponse.data.message);
      }
    } catch (loginError) {
      console.log('❌ Login error:', loginError.response?.data?.message || loginError.message);
    }

  } catch (error) {
    console.error('❌ Health check failed:', error.message);
  }
}

testAuthFlow();
