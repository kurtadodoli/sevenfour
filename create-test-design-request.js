// Test script to create a sample custom design request with images
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function createTestDesignRequest() {
    try {
        console.log('🧪 Creating test custom design request with images...\n');
        
        // First, let's login to get a token
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'admin@admin.com',
            password: 'admin123'
        });
        
        if (!loginResponse.data.success) {
            console.log('❌ Failed to login');
            return;
        }
        
        const token = loginResponse.data.token;
        console.log('✅ Logged in successfully');
        
        // Create a simple test image file
        const testImagePath = path.join(__dirname, 'test-design-image.txt');
        fs.writeFileSync(testImagePath, 'This is a test design image file for testing the View Designs feature.');
        
        // Create form data
        const formData = new FormData();
        formData.append('productType', 'shirt');
        formData.append('customerName', 'Test Customer');
        formData.append('customerEmail', 'test@example.com');
        formData.append('customerPhone', '09123456789');
        formData.append('municipality', 'Quezon City');
        formData.append('province', 'Metro Manila');
        formData.append('streetNumber', '123 Test Street');
        formData.append('postalCode', '1100');
        formData.append('productSize', 'L');
        formData.append('productColor', 'Blue');
        formData.append('productName', 'Test Custom Shirt');
        formData.append('quantity', '1');
        formData.append('additionalInfo', 'Test design request for View Designs feature');
        
        // Add the test image
        formData.append('images', fs.createReadStream(testImagePath));
        
        const response = await axios.post('http://localhost:5000/api/custom-orders', formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                ...formData.getHeaders()
            }
        });
        
        if (response.data.success) {
            console.log('✅ Test custom design request created successfully!');
            console.log('Order ID:', response.data.customOrderId);
            console.log('\n🎨 You can now test the "View Designs" button in the Custom Design Requests tab');
            console.log('👀 Navigate to: http://localhost:3000/admin/transactions');
            console.log('📋 Click on "Custom Design Requests" tab');
            console.log('🔍 Look for the "Designs" button next to the test order');
        } else {
            console.log('❌ Failed to create test design request:', response.data.message);
        }
        
        // Clean up test file
        fs.unlinkSync(testImagePath);
        
    } catch (error) {
        console.error('❌ Error creating test design request:', error.message);
    }
}

// Run the test
createTestDesignRequest();
