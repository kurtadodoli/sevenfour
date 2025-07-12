// Test with a real JWT token
const jwt = require('jsonwebtoken');
const axios = require('axios');

// Load environment variables
require('dotenv').config({ path: 'server/.env' });

// JWT Secret (same as in auth middleware)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

console.log('JWT_SECRET loaded:', JWT_SECRET ? 'YES' : 'NO');
console.log('JWT_SECRET length:', JWT_SECRET?.length || 0);

async function testWithRealToken() {
    try {
        console.log('Testing with real JWT token...');
        
        // Create a real JWT token for the user
        const userData = {
            id: 967502321335218,
            email: 'krutadodoli@gmail.com',
            first_name: 'Kurt',
            last_name: 'Adodoli',
            role: 'admin'
        };
        
        const token = jwt.sign(userData, JWT_SECRET, { expiresIn: '1h' });
        console.log('✅ JWT token created');
        
        // Test the cancellation request with the exact data structure from frontend
        const testData = {
            customOrderId: 'CUSTOM-MCSS0ZFM-7LW55',
            order_number: 'ORD-SOME-NUMBER', // This might be different
            reason: 'Test cancellation reason - changed my mind',
            order_type: 'custom'
        };
        
        console.log('Sending request with data:', JSON.stringify(testData, null, 2));
        
        const response = await axios.post('http://localhost:5000/api/custom-orders/cancellation-requests', testData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('✅ Success! Response:', response.data);
        
    } catch (error) {
        console.error('❌ Error Details:');
        console.error('Status:', error.response?.status);
        console.error('Status Text:', error.response?.statusText);
        console.error('Response Data:', JSON.stringify(error.response?.data, null, 2));
        console.error('Full Error:', error.message);
        
        // If it's a 500 error, let's add some debug info
        if (error.response?.status === 500) {
            console.log('\n🔍 This is the 500 error we\'ve been looking for!');
        }
    }
}

testWithRealToken();
