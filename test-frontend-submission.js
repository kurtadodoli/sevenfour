const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');
const path = require('path');

async function testFrontendSubmission() {
  try {
    console.log('🧪 Testing Frontend-like Custom Design Submission...\n');

    const formData = new FormData();
    
    // Exact fields that frontend sends
    formData.append('productType', 'jerseys');
    formData.append('firstName', 'John');
    formData.append('lastName', 'Doe');
    formData.append('email', 'john.doe@test.com');
    formData.append('customerPhone', '09123456789');
    formData.append('shippingAddress', '123 Test Street');
    formData.append('municipality', 'Makati');
    formData.append('barangay', 'Test Barangay');
    formData.append('postalCode', '1234');
    formData.append('productSize', 'L');
    formData.append('productColor', 'Blue');
    formData.append('productName', 'jerseys');
    formData.append('quantity', '1');
    formData.append('additionalInfo', 'Test custom jersey order');

    // Create a simple test image file
    const testImagePath = path.join(__dirname, 'test-image.jpg');
    
    // Create a minimal JPEG file (just headers to make it valid)
    const jpegHeader = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46]);
    const jpegEnd = Buffer.from([0xFF, 0xD9]);
    const testImageBuffer = Buffer.concat([jpegHeader, Buffer.alloc(100, 0), jpegEnd]);
    
    fs.writeFileSync(testImagePath, testImageBuffer);
    console.log('📎 Created test image file');

    // Add the image file
    formData.append('images', fs.createReadStream(testImagePath), {
      filename: 'test-image.jpg',
      contentType: 'image/jpeg'
    });

    console.log('📤 Sending test submission with exact frontend format...');
    
    const response = await axios.post('http://localhost:3001/api/custom-designs', formData, {
      headers: {
        ...formData.getHeaders()
      },
      timeout: 30000
    });

    console.log('✅ Success:', response.data);
    
    // Clean up test file
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
      console.log('🗑️ Cleaned up test image file');
    }
    
  } catch (error) {
    console.error('❌ Error Details:');
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Error Message:', error.response?.data?.message || error.message);
    console.error('Error Code:', error.response?.data?.errorCode);
    console.error('SQL Message:', error.response?.data?.sqlMessage);
    console.error('Full Response:', JSON.stringify(error.response?.data, null, 2));
    
    // Clean up test file on error
    const testImagePath = path.join(__dirname, 'test-image.jpg');
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
      console.log('🗑️ Cleaned up test image file');
    }
  }
}

testFrontendSubmission();
