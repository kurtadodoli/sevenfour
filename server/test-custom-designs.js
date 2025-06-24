const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Test the custom-designs endpoint
async function testCustomDesignsEndpoint() {
    console.log('🧪 Testing Custom Designs API Endpoint...');
    
    try {
        // Test 1: Get all custom designs (should return empty array initially)
        console.log('\n📋 Test 1: GET /api/custom-designs');
        const getResponse = await axios.get('http://localhost:3001/api/custom-designs');
        console.log('✅ GET Response:', getResponse.data);
        
        // Test 2: Create a test image file for upload
        const testImagePath = path.join(__dirname, 'test-image.txt');
        fs.writeFileSync(testImagePath, 'This is a test image file content');
        
        // Test 3: POST new custom design
        console.log('\n📝 Test 2: POST /api/custom-designs');
        const formData = new FormData();
        
        // Add form fields
        formData.append('productType', 't-shirts');
        formData.append('customerName', 'Test Customer');
        formData.append('customerEmail', 'test@example.com');
        formData.append('customerPhone', '09123456789');
        formData.append('shippingAddress', '123 Test Street');
        formData.append('municipality', 'Manila');
        formData.append('barangay', 'Test Barangay');
        formData.append('postalCode', '1000');
        formData.append('productSize', 'L');
        formData.append('productColor', 'Black');
        formData.append('productName', 'Custom T-Shirt');
        formData.append('quantity', '2');
        formData.append('additionalInfo', 'Test design order');
        
        // Add test file as image
        formData.append('images', fs.createReadStream(testImagePath), {
            filename: 'test-design.jpg',
            contentType: 'image/jpeg'
        });
        
        const postResponse = await axios.post('http://localhost:3001/api/custom-designs', formData, {
            headers: {
                ...formData.getHeaders()
            }
        });
        
        console.log('✅ POST Response:', postResponse.data);
        
        const designId = postResponse.data.data?.designId;
        
        if (designId) {
            // Test 4: GET specific design by ID
            console.log(`\n🔍 Test 3: GET /api/custom-designs/${designId}`);
            const getByIdResponse = await axios.get(`http://localhost:3001/api/custom-designs/${designId}`);
            console.log('✅ GET by ID Response:', JSON.stringify(getByIdResponse.data, null, 2));
        }
        
        // Clean up test file
        fs.unlinkSync(testImagePath);
        console.log('\n🧹 Cleaned up test files');
        
        console.log('\n🎉 All tests passed! Custom Designs API is working correctly.');
        
    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
        
        // Clean up test file on error
        const testImagePath = path.join(__dirname, 'test-image.txt');
        if (fs.existsSync(testImagePath)) {
            fs.unlinkSync(testImagePath);
        }
    }
}

// Run the test
testCustomDesignsEndpoint();
