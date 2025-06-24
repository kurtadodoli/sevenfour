const axios = require('axios');

async function testUserAuth() {
  console.log('🔐 Testing User Authentication Flow\n');

  try {
    // Step 1: Try to login with existing credentials mentioned in the code
    console.log('1️⃣ Testing existing user logins...');
    
    const knownCredentials = [
      { email: 'admin@sevenfour.com', password: 'Admin@123' },
      { email: 'kurtadodoli@gmail.com', password: 'Admin123!@#' },
      { email: 'john.doe@test.com', password: 'password123' },
      { email: 'john.doe@test.com', password: 'Test123!@#' },
      { email: 'testuser@example.com', password: 'Test123!@#' }
    ];

    for (const creds of knownCredentials) {
      try {
        console.log(`Trying: ${creds.email}...`);
        const response = await axios.post('http://localhost:3001/api/auth/login', creds);
        
        if (response.data.success) {
          console.log(`✅ ${creds.email}: Login successful!`);
          console.log(`   User: ${response.data.data.user.first_name} ${response.data.data.user.last_name}`);
          console.log(`   Email: ${response.data.data.user.email}`);
          console.log(`   Role: ${response.data.data.user.role}`);
          
          // Check if this user has custom orders
          const ordersResponse = await axios.get(`http://localhost:3001/api/user-designs/${encodeURIComponent(response.data.data.user.email)}`);
          const orderCount = ordersResponse.data.success ? ordersResponse.data.data.length : 0;
          console.log(`   Custom Orders: ${orderCount}`);
          
        } else {
          console.log(`❌ ${creds.email}: Login failed - ${response.data.message}`);
        }
      } catch (error) {
        console.log(`❌ ${creds.email}: ${error.response?.data?.message || error.message}`);
      }
    }

    // Step 2: Try to create a user with the email that has custom orders
    console.log('\n2️⃣ Creating test user with john.doe@test.com...');
    
    const newUser = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@test.com',
      password: 'TestPassword123!',
      gender: 'male',
      birthday: '1990-01-01'
    };

    try {
      const registerResponse = await axios.post('http://localhost:3001/api/auth/register', newUser);
      console.log('✅ User registration successful!');
      console.log(`   User ID: ${registerResponse.data.data.user.id}`);
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('✅ User already exists - that\'s good!');
        
        // Try to login with the new password
        try {
          const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
            email: newUser.email,
            password: newUser.password
          });
          console.log('✅ Login with new password successful!');
        } catch (loginError) {
          console.log('❌ Login with new password failed, trying default passwords...');
          
          // Try common passwords
          const commonPasswords = ['password', 'Password123!', 'Test123!@#', 'TestPassword123!'];
          for (const pwd of commonPasswords) {
            try {
              const testLogin = await axios.post('http://localhost:3001/api/auth/login', {
                email: newUser.email,
                password: pwd
              });
              console.log(`✅ Login successful with password: ${pwd}`);
              break;
            } catch (e) {
              console.log(`❌ Failed with password: ${pwd}`);
            }
          }
        }
      } else {
        console.log('❌ Registration failed:', error.response?.data?.message || error.message);
      }
    }

  } catch (error) {
    console.error('❌ Test Error:', error.message);
  }
}

testUserAuth();
