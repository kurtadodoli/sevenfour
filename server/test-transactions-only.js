const axios = require('axios');

const baseURL = 'http://localhost:5000';

async function testTransactionsOnly() {
    console.log('🔍 Testing transactions endpoint only...\n');
    
    try {
        // Login first
        console.log('1. Logging in...');
        const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
            email: 'test@admin.com',
            password: 'admin123'
        });
        
        const token = loginResponse.data.data.token;
        console.log('✅ Login successful');
        
        // Test transactions endpoint with different parameters
        console.log('\n2. Testing transactions endpoint with no parameters...');
        try {
            const response = await axios.get(`${baseURL}/api/orders/transactions/all`, {
                headers: { 'Authorization': `Bearer ${token}` },
                timeout: 10000
            });
            console.log('✅ Transactions endpoint working');
            console.log('Response status:', response.status);
            console.log('Response data (first 1000 chars):', JSON.stringify(response.data, null, 2).substring(0, 1000) + '...');
        } catch (error) {
            if (error.response) {
                console.log('❌ Transactions error:');
                console.log('Status:', error.response.status);
                console.log('Data:', JSON.stringify(error.response.data, null, 2));
            } else {
                console.log('❌ Request error:', error.message);
            }
        }
        
        console.log('\n3. Testing transactions endpoint with limit parameters...');
        try {
            const response = await axios.get(`${baseURL}/api/orders/transactions/all?page=1&limit=5`, {
                headers: { 'Authorization': `Bearer ${token}` },
                timeout: 10000
            });
            console.log('✅ Transactions endpoint working with parameters');
            console.log('Response status:', response.status);
        } catch (error) {
            if (error.response) {
                console.log('❌ Transactions error with parameters:');
                console.log('Status:', error.response.status);
                console.log('Data:', JSON.stringify(error.response.data, null, 2));
            } else {
                console.log('❌ Request error:', error.message);
            }
        }
        
    } catch (error) {
        console.error('❌ Login failed:', error.message);
    }
}

testTransactionsOnly().then(() => {
    console.log('\n🏁 Transactions test completed');
    process.exit(0);
}).catch(error => {
    console.error('Test script error:', error);
    process.exit(1);
});
