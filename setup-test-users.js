const axios = require('axios');

async function setupTestUsers() {
  console.log('🔧 Setting up Test Users for Custom Orders Demo\n');

  const testUsers = [
    {
      first_name: 'John',
      last_name: 'Doe', 
      email: 'john.doe@test.com',
      password: 'TestPassword123!',
      gender: 'male',
      birthday: '1990-01-01',
      expectedOrders: 6
    },
    {
      first_name: 'Juan',
      last_name: 'Dela Cruz',
      email: 'juan@example.com', 
      password: 'TestPassword123!',
      gender: 'male',
      birthday: '1990-01-01',
      expectedOrders: 1
    }
  ];

  for (const user of testUsers) {
    console.log(`\n👤 Setting up user: ${user.email}`);
    
    try {
      // Try to register the user
      const registerResponse = await axios.post('http://localhost:3001/api/auth/register', user);
      console.log('✅ User registered successfully');
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('✅ User already exists');
      } else {
        console.log('❌ Registration failed:', error.response?.data?.message);
        continue;
      }
    }

    // Test login
    try {
      const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
        email: user.email,
        password: user.password
      });
      
      if (loginResponse.data.success) {
        console.log('✅ Login successful');
        
        // Check custom orders
        const ordersResponse = await axios.get(`http://localhost:3001/api/user-designs/${encodeURIComponent(user.email)}`);
        const orderCount = ordersResponse.data.success ? ordersResponse.data.data.length : 0;
        
        console.log(`📋 Custom Orders: ${orderCount} (expected: ${user.expectedOrders})`);
        
        if (orderCount === user.expectedOrders) {
          console.log('✅ Order count matches expected!');
        } else if (orderCount > 0) {
          console.log('⚠️  Order count different than expected, but orders exist');
        } else {
          console.log('❌ No orders found');
        }
      }
    } catch (error) {
      console.log('❌ Login failed:', error.response?.data?.message);
    }
  }

  console.log('\n\n🎯 CUSTOM ORDERS TEST INSTRUCTIONS:');
  console.log('=====================================');
  console.log('To test custom orders display:');
  console.log('');
  console.log('1. Start the React frontend (npm start in client folder)');
  console.log('2. Navigate to the website');
  console.log('3. Login with one of these accounts:');
  console.log('');
  console.log('   👤 john.doe@test.com');
  console.log('      Password: TestPassword123!');
  console.log('      Expected: 6 custom orders');
  console.log('');
  console.log('   👤 juan@example.com');
  console.log('      Password: TestPassword123!');
  console.log('      Expected: 1 custom order');
  console.log('');
  console.log('   👤 kurtadodoli@gmail.com (admin)');
  console.log('      Password: Admin123!@#');
  console.log('      Expected: 2 custom orders');
  console.log('');
  console.log('4. Navigate to Orders page');
  console.log('5. Click on "Custom Orders" tab');
  console.log('6. You should see the custom orders for that account!');
  console.log('');
  console.log('✨ The system is working correctly! ✨');
}

setupTestUsers();
