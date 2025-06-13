// Test CORS and API communication directly
const apiUrl = 'http://localhost:5000/api/auth/register';

// Generate a unique email
const testEmail = `test_${new Date().getTime()}@example.com`;

// Test user data
const testUser = {
  first_name: 'Test',
  last_name: 'User',
  email: testEmail,
  password: 'TestPass1!',
  gender: 'male',
  birthday: '1990-01-01'
};

// Function to test the API directly
async function testApiDirect() {
  try {
    console.log('Testing direct API connection...');
    console.log('Sending to:', apiUrl);
    console.log('Data:', testUser);
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(testUser)
    };
    
    console.log('Request options:', options);
    
    const response = await fetch(apiUrl, options);
    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    console.log('Response data:', data);
    
    return { success: true, data };
  } catch (error) {
    console.error('API test error:', error);
    return { success: false, error: error.toString() };
  }
}

// Run the test when the script loads
testApiDirect().then(result => {
  console.log('Test complete:', result.success);
});
