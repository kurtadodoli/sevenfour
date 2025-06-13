// Script to test the full authentication flow
const axios = require('axios');
require('dotenv').config();

const API_URL = 'http://localhost:5000';
const TEST_USER = {
  first_name: 'IntegrationTest',
  last_name: 'User',
  email: `test_${Date.now()}@example.com`,
  password: 'TestPassword1!',
  gender: 'other',
  birthday: '1990-01-01'
};

async function testAuthFlow() {
  console.log('Starting auth flow integration test...');
  console.log('Test user:', TEST_USER);
  
  try {
    // Step 1: Register a new user
    console.log('\n1. Testing registration...');
    let response;
    
    try {
      response = await axios.post(`${API_URL}/api/auth/register`, TEST_USER, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'AuthFlow-Test-Script'
        }
      });
      
      console.log('Registration successful!');
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      
      if (!response.data.data || !response.data.data.token) {
        throw new Error('No token received in registration response');
      }
      
      const token = response.data.data.token;
      
      // Step 2: Test authentication with the token
      console.log('\n2. Testing authentication with token...');
      const authResponse = await axios.get(`${API_URL}/api/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Authentication successful!');
      console.log('Response status:', authResponse.status);
      console.log('User data:', authResponse.data.data.user);
      
      // Step 3: Test login with the same credentials
      console.log('\n3. Testing login...');
      const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
        email: TEST_USER.email,
        password: TEST_USER.password
      });
      
      console.log('Login successful!');
      console.log('Response status:', loginResponse.status);
      console.log('Login data:', loginResponse.data);
      
      console.log('\nIntegration test completed successfully!');
      return true;
      
    } catch (error) {
      console.error('Test failed:');
      if (error.response) {
        // The request was made and the server responded with status outside of 2xx range
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
        console.error('Headers:', error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
      } else {
        // Something else caused the error
        console.error('Error:', error.message);
      }
      return false;
    }
    
  } finally {
    // Clean up - we would delete the test user here in a real integration test
    // but we'll skip it for now
    console.log('Test completed. Remember to clean up test users.');
    process.exit(0);
  }
}

// Run the test
testAuthFlow();
