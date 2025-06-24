const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testCustomDesignSubmission() {
  try {
    console.log('🧪 Testing Custom Design Submission');
    console.log('===================================');
    
    // First, test authentication by getting a token
    console.log('1️⃣ Testing user login to get token...');
    
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'kurtadodll@gmail.com', // Use a real user email from your database
      password: 'password123' // Use the actual password
    });
    
    if (!loginResponse.data.success) {
      console.log('❌ Login failed:', loginResponse.data.message);
      return;
    }
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful, got token');
    
    // Test the custom design submission
    console.log('\n2️⃣ Testing custom design submission...');
    
    const formData = new FormData();
    
    // Add form fields exactly as the frontend does
    formData.append('productType', 'tshirt');
    formData.append('firstName', 'Test');
    formData.append('lastName', 'User');
    formData.append('email', 'kurtadodll@gmail.com');
    formData.append('customerPhone', '1234567890');
    formData.append('shippingAddress', 'Test Street 123, Manila, Metro Manila, 1000');
    formData.append('municipality', 'Manila');
    formData.append('barangay', '');
    formData.append('postalCode', '1000');
    formData.append('productSize', 'L');
    formData.append('productColor', 'Red');
    formData.append('productName', 'tshirt');
    formData.append('quantity', '1');
    formData.append('additionalInfo', 'Test custom design');
    
    // Create a small test image file
    const testImagePath = path.join(__dirname, 'test-image.txt');
    fs.writeFileSync(testImagePath, 'test image content');
    formData.append('images', fs.createReadStream(testImagePath), {
      filename: 'test-image.jpg',
      contentType: 'image/jpeg'
    });
    
    console.log('📤 Sending request to /api/custom-designs...');
    
    const response = await axios.post('http://localhost:3001/api/custom-designs', formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders()
      },
      timeout: 30000
    });
    
    console.log('✅ Custom design submission successful!');
    console.log('Response:', response.data);
    
    // Clean up test file
    fs.unlinkSync(testImagePath);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('❌ Response status:', error.response.status);
      console.error('❌ Response data:', error.response.data);
    }
    console.error('❌ Full error:', error);
    
    // Clean up test file if it exists
    const testImagePath = path.join(__dirname, 'test-image.txt');
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
  }
}

testCustomDesignSubmission();
