const axios = require('axios');

async function testNewUserLogin() {
  console.log('🧪 Testing New User Login and Custom Orders Fetch\n');

  try {
    // Step 1: Login with the newly created user
    console.log('1️⃣ Logging in as john.doe@test.com...');
    
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'john.doe@test.com',
      password: 'TestPassword123!'
    });

    if (loginResponse.data.success) {
      console.log('✅ Login successful!');
      console.log(`   User: ${loginResponse.data.data.user.first_name} ${loginResponse.data.data.user.last_name}`);
      console.log(`   Email: ${loginResponse.data.data.user.email}`);
      console.log(`   User Object Keys:`, Object.keys(loginResponse.data.data.user));
      
      const user = loginResponse.data.data.user;
      const token = loginResponse.data.data.token;
      
      // Step 2: Test the exact same email detection logic that OrderPage.js uses
      console.log('\n2️⃣ Testing email detection logic...');
      
      const getUserEmail = (user) => {
        if (!user) return null;
        
        console.log('🔍 Analyzing user object for email:', user);
        console.log('🔍 User object keys:', Object.keys(user));
        
        // Try different possible email property names (same as OrderPage.js)
        const email = user.email || 
                      user.user_email || 
                      user.Email || 
                      user.userEmail || 
                      user.emailAddress ||
                      user.mail ||
                      user.username || 
                      user.id;
        
        console.log('📧 Detected email:', email);
        return email;
      };
      
      const detectedEmail = getUserEmail(user);
      
      // Step 3: Test fetching custom orders with detected email
      console.log('\n3️⃣ Fetching custom orders with detected email...');
      
      if (detectedEmail) {
        try {
          const ordersResponse = await axios.get(`http://localhost:3001/api/user-designs/${encodeURIComponent(detectedEmail)}`);
          
          if (ordersResponse.data.success) {
            console.log(`✅ Found ${ordersResponse.data.data.length} custom orders for ${detectedEmail}`);
            
            if (ordersResponse.data.data.length > 0) {
              console.log('📋 Custom Orders:');
              ordersResponse.data.data.forEach((order, index) => {
                console.log(`   ${index + 1}. ${order.custom_order_id} - ${order.customer_name} (${order.status})`);
              });
            }
          } else {
            console.log('❌ No orders found');
          }
        } catch (error) {
          console.log('❌ Error fetching orders:', error.response?.data || error.message);
        }
      } else {
        console.log('❌ Could not detect email from user object');
      }
      
      // Step 4: Test with authentication header
      console.log('\n4️⃣ Testing authenticated request...');
      
      try {
        const authOrdersResponse = await axios.get('http://localhost:3001/api/user-designs', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('✅ Authenticated orders fetch:', authOrdersResponse.data);
      } catch (error) {
        console.log('❌ Authenticated request failed:', error.response?.data || error.message);
      }

    } else {
      console.log('❌ Login failed:', loginResponse.data.message);
    }

  } catch (error) {
    console.error('❌ Test Error:', error.response?.data || error.message);
  }
}

testNewUserLogin();
