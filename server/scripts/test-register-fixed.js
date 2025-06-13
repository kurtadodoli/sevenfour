const axios = require('axios');

// Test user data
const testUser = {
  first_name: 'Test',
  last_name: 'User',
  email: 'testuser' + Date.now() + '@example.com', // Unique email
  password: 'Test1234!',
  gender: 'male',
  birthday: '1990-01-01'
};

async function testRegistration() {
  try {
    console.log('Testing registration with data:', testUser);
    
    const response = await axios.post('http://localhost:5000/api/auth/register', testUser);
    
    console.log('Registration successful!');
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    return true;
  } catch (error) {
    console.error('Registration failed!');
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request setup error:', error.message);
    }
    
    return false;
  }
}

testRegistration().then(success => {
  if (success) {
    console.log('Test completed successfully!');
  } else {
    console.log('Test failed!');
  }
  process.exit(0);
});
