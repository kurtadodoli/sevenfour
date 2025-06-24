const axios = require('axios');

async function testAutoEmailCustomOrder() {
    console.log('🧪 TESTING AUTOMATIC EMAIL CUSTOM ORDER SUBMISSION\n');
    
    try {
        // Step 1: Login to get JWT token
        console.log('1. Logging in to get authentication token...');
        const loginResponse = await axios.post('http://localhost:3001/api/users/login', {
            email: 'kurtadodoli@gmail.com',
            password: 'password123'
        });
        
        if (!loginResponse.data.success) {
            console.log('❌ Login failed:', loginResponse.data.message);
            return;
        }
        
        const token = loginResponse.data.token;
        const user = loginResponse.data.user;
        console.log('✅ Login successful');
        console.log('   User email:', user.email);
        console.log('   Token received:', token ? 'Yes' : 'No');
          // Step 2: Submit custom order WITHOUT email in form data
        console.log('\n2. Submitting custom order without email field...');
        
        // Use axios with multipart data instead of FormData since we're in Node.js
        const FormData = require('form-data');
        const formData = new FormData();
        formData.append('productType', 't-shirts');
        formData.append('productName', 'Test Auto-Email T-Shirt');
        formData.append('size', 'M');
        formData.append('color', 'Black');
        formData.append('quantity', '1');
        formData.append('specialInstructions', 'Testing automatic email assignment');
        formData.append('customerName', 'Kurt Test');
        // NOTE: NO customerEmail field - should be auto-filled from JWT token
        formData.append('customerPhone', '09123456789');
        formData.append('province', 'Metro Manila');
        formData.append('municipality', 'Quezon City');
        formData.append('streetNumber', 'Test Street 123');
        formData.append('houseNumber', '456');
        formData.append('barangay', 'Test Barangay');
        formData.append('postalCode', '1100');
          // Create a simple test image file with proper extension
        const fs = require('fs');
        const path = require('path');
        
        // Create a minimal test image file with .jpg extension
        const testImagePath = path.join(__dirname, 'temp-test-image.jpg');
        fs.writeFileSync(testImagePath, 'fake image content for testing');
        formData.append('images', fs.createReadStream(testImagePath), {
            filename: 'test-image.jpg',
            contentType: 'image/jpeg'
        });
        
        const headers = {
            'Authorization': `Bearer ${token}`,
            ...formData.getHeaders()
        };
        
        console.log('📤 Submitting order with auto-email...');
        const orderResponse = await axios.post('http://localhost:3001/api/custom-orders', formData, {
            headers
        });
        
        // Clean up test file
        fs.unlinkSync(testImagePath);
        
        console.log('✅ Order submission successful!');
        console.log('   Order ID:', orderResponse.data.customOrderId);
        console.log('   Response:', orderResponse.data);
        
        // Step 3: Verify the order was saved with correct email
        console.log('\n3. Verifying order was saved with automatic email...');
        const ordersResponse = await axios.get('http://localhost:3001/api/custom-orders/my-orders', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const latestOrder = ordersResponse.data.data[0]; // Most recent order
        console.log('📋 Latest order details:');
        console.log('   Order ID:', latestOrder.custom_order_id);
        console.log('   Customer Email:', latestOrder.customer_email);
        console.log('   Expected Email:', user.email);
        console.log('   Email Match:', latestOrder.customer_email === user.email ? '✅ YES' : '❌ NO');
        
        if (latestOrder.customer_email === user.email) {
            console.log('\n🎉 SUCCESS! Email was automatically assigned from JWT token');
        } else {
            console.log('\n❌ FAILED! Email was not properly assigned');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.log('Response status:', error.response.status);
            console.log('Response data:', error.response.data);
        }
    }
}

testAutoEmailCustomOrder();
