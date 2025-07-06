const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testOrderCreation() {
    console.log('🧪 TESTING ORDER CREATION API CALL');
    console.log('This simulates the exact same call that the frontend makes');

    try {
        // First, let's login to get a token
        console.log('\n1. Logging in to get authentication token...');
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'test@test.com', // Replace with a real test user email
            password: 'password123'  // Replace with a real test user password
        });
        
        const token = loginResponse.data.token;
        console.log('✅ Login successful, got token');

        // Create a dummy image file for payment proof
        console.log('\n2. Creating dummy payment proof file...');
        const dummyImagePath = path.join(__dirname, 'test-payment-proof.jpg');
        if (!fs.existsSync(dummyImagePath)) {
            // Create a minimal dummy file (you might need to create this manually)
            console.log('⚠️ Creating minimal dummy file...');
            fs.writeFileSync(dummyImagePath, 'dummy-image-data');
        }

        // Create FormData exactly like the frontend does
        console.log('\n3. Creating FormData (simulating frontend)...');
        const formData = new FormData();
        formData.append('customer_name', 'Test Customer');
        formData.append('customer_email', 'test@test.com');
        formData.append('contact_phone', '09123456789');
        formData.append('shipping_address', '123 Test Street, Test City, Metro Manila, 1234');
        formData.append('province', 'Metro Manila');
        formData.append('city_municipality', 'Test City');
        formData.append('street_address', '123 Test Street');
        formData.append('zip_code', '1234');
        formData.append('payment_method', 'gcash');
        formData.append('payment_reference', 'REF123456789');
        formData.append('notes', 'Test order from API simulation');
        formData.append('payment_proof', fs.createReadStream(dummyImagePath), 'test-payment-proof.jpg');

        console.log('\n4. Making API call to POST /api/orders...');
        console.log('📡 URL: http://localhost:5000/api/orders');
        console.log('🔐 Authorization: Bearer [token]');

        const response = await axios.post('http://localhost:5000/api/orders', formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                ...formData.getHeaders()
            }
        });

        console.log('\n✅ SUCCESS! Order created:', response.data);

    } catch (error) {
        console.log('\n❌ ERROR CAUGHT!');
        console.log('Error message:', error.message);
        console.log('Error code:', error.code);
        
        if (error.response) {
            console.log('Response status:', error.response.status);
            console.log('Response data:', error.response.data);
            
            // This is where we should see the customer_fullname error if it occurs
            if (error.response.data && error.response.data.message) {
                if (error.response.data.message.includes('customer_fullname')) {
                    console.log('\n🚨 FOUND THE CUSTOMER_FULLNAME ERROR!');
                    console.log('This confirms the error is happening in the server code.');
                }
            }
        }
        
        if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
            console.log('\n⚠️ Server connection error. Make sure the server is running on port 5000.');
        }
    }
}

// Also provide manual instructions
console.log('🔧 MANUAL TEST INSTRUCTIONS:');
console.log('1. Make sure the server is running on port 5000');
console.log('2. Create a test user account if needed');
console.log('3. Update the login credentials above');
console.log('4. Run this script with: node test-order-api.js');
console.log('');

testOrderCreation().catch(console.error);
