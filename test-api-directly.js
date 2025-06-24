// Test script for custom orders API
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

async function testCustomOrdersAPI() {
    console.log('🧪 Testing Custom Orders API...');
    
    try {
        // Test 1: Server connectivity
        console.log('\n1. Testing server connectivity...');
        const healthResponse = await axios.get('http://localhost:3001/api/test');
        console.log('✅ Server is running:', healthResponse.data);
        
        // Test 2: Custom order submission
        console.log('\n2. Testing custom order submission...');
        
        const formData = new FormData();
        
        // Add form fields
        formData.append('productType', 't-shirts');
        formData.append('size', 'M');
        formData.append('color', 'black');
        formData.append('quantity', '2');
        formData.append('urgency', 'standard');
        formData.append('specialInstructions', 'Test order from API test script');
        formData.append('customerName', 'John Doe');
        formData.append('customerEmail', 'john.doe@example.com');
        formData.append('customerPhone', '09123456789');
        formData.append('province', 'Metro Manila');
        formData.append('municipality', 'Quezon City');
        formData.append('streetNumber', '123 Test Street');
        formData.append('houseNumber', 'Unit 456');
        formData.append('barangay', 'Test Barangay');
        formData.append('postalCode', '1100');
        
        // Create a simple test image file
        const testImageContent = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
        const testImagePath = 'test-image.png';
        fs.writeFileSync(testImagePath, testImageContent);
        
        // Add the test image
        formData.append('images', fs.createReadStream(testImagePath), {
            filename: 'test-design.png',
            contentType: 'image/png'
        });
        
        const response = await axios.post('http://localhost:3001/api/custom-orders', formData, {
            headers: {
                ...formData.getHeaders(),
                'Content-Type': 'multipart/form-data'
            },
            timeout: 30000
        });
        
        console.log('✅ Custom order submission successful:', response.data);
        
        // Clean up test file
        fs.unlinkSync(testImagePath);
        
        console.log('\n🎉 All tests passed! The API is working correctly.');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
        } else if (error.request) {
            console.error('Request made but no response received');
        } else {
            console.error('Error setting up request:', error.message);
        }
    }
}

testCustomOrdersAPI();
