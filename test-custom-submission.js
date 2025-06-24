const axios = require('axios');

async function testCustomDesignSubmission() {
  try {
    console.log('🧪 Testing Custom Design Submission...\n');

    // Test data similar to what the frontend would send
    const formData = new FormData();
    
    // Basic fields
    formData.append('firstName', 'Test');
    formData.append('lastName', 'User');
    formData.append('email', 'testuser@example.com');
    formData.append('customerPhone', '09123456789');
    formData.append('productType', 'jerseys');
    formData.append('productName', 'Custom Hockey Jersey');
    formData.append('productColor', 'Blue');
    formData.append('productSize', 'L');
    formData.append('quantity', '1');
    formData.append('municipality', 'Makati');
    formData.append('additionalInfo', 'Test submission');

    // Create a test image file (empty buffer for testing)
    const testImageBuffer = Buffer.from('test image data');
    const blob = new Blob([testImageBuffer], { type: 'image/jpeg' });
    formData.append('images', blob, 'test-image.jpg');

    console.log('📤 Sending test submission...');
    
    const response = await axios.post('http://localhost:3001/api/custom-designs', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    console.log('✅ Success:', response.data);
    
  } catch (error) {
    console.error('❌ Error Details:');
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Error Message:', error.response?.data?.message || error.message);
    console.error('Full Response:', error.response?.data);
    
    if (error.response?.status === 500) {
      console.log('\n🔍 This is a server error. Let me check the backend logs...');
    }
  }
}

testCustomDesignSubmission();
