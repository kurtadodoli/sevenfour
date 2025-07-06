const axios = require('axios');

const baseURL = 'http://localhost:5000';

async function debugEndpoints() {
    console.log('🔍 Debugging specific endpoint issues...\n');
    
    try {
        // Login first
        console.log('1. Logging in...');
        const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
            email: 'test@admin.com',
            password: 'admin123'
        });
        
        const token = loginResponse.data.data.token;
        console.log('✅ Login successful');
        
        // Test 1: Check if the refund-requests endpoint exists
        console.log('\n2. Testing refund-requests endpoint...');
        try {
            const response = await axios.get(`${baseURL}/api/orders/refund-requests`, {
                headers: { 'Authorization': `Bearer ${token}` },
                timeout: 5000
            });
            console.log('✅ Refund requests endpoint working');
            console.log('Response status:', response.status);
            console.log('Response data:', JSON.stringify(response.data, null, 2));
        } catch (error) {
            if (error.response) {
                console.log('❌ Refund requests error:');
                console.log('Status:', error.response.status);
                console.log('Headers:', error.response.headers);
                console.log('Data:', JSON.stringify(error.response.data, null, 2));
            } else if (error.request) {
                console.log('❌ No response received for refund requests');
                console.log('Request:', error.request);
            } else {
                console.log('❌ Error setting up refund requests request:', error.message);
            }
        }
        
        // Test 2: Check the transactions endpoint
        console.log('\n3. Testing transactions/all endpoint...');
        try {
            const response = await axios.get(`${baseURL}/api/orders/transactions/all`, {
                headers: { 'Authorization': `Bearer ${token}` },
                timeout: 5000
            });
            console.log('✅ Transactions endpoint working');
            console.log('Response status:', response.status);
            console.log('Response data (first 500 chars):', JSON.stringify(response.data, null, 2).substring(0, 500) + '...');
        } catch (error) {
            if (error.response) {
                console.log('❌ Transactions error:');
                console.log('Status:', error.response.status);
                console.log('Headers:', error.response.headers);
                console.log('Data:', JSON.stringify(error.response.data, null, 2));
            } else if (error.request) {
                console.log('❌ No response received for transactions');
                console.log('Request:', error.request);
            } else {
                console.log('❌ Error setting up transactions request:', error.message);
            }
        }
        
        // Test 3: Check what endpoints are available
        console.log('\n4. Testing base API endpoint...');
        try {
            const response = await axios.get(`${baseURL}/api/`, {
                headers: { 'Authorization': `Bearer ${token}` },
                timeout: 5000
            });
            console.log('Base API response:', response.data);
        } catch (error) {
            console.log('Base API not available or protected');
        }
        
    } catch (error) {
        console.error('❌ Debug test failed:', error.message);
    }
}

debugEndpoints().then(() => {
    console.log('\n🏁 Debug completed');
    process.exit(0);
}).catch(error => {
    console.error('Debug script error:', error);
    process.exit(1);
});
