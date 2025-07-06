const axios = require('axios');

const baseURL = 'http://localhost:5000';

async function testAuthEndpoints() {
    console.log('Testing authenticated endpoints...\n');
    
    try {
        // Test /api/orders/refund-requests (authenticated)
        console.log('1. Testing /api/orders/refund-requests (authenticated)');
        const refundResponse = await axios.get(`${baseURL}/api/orders/refund-requests`, {
            timeout: 10000
        });
        console.log('Status:', refundResponse.status);
        console.log('Data:', JSON.stringify(refundResponse.data, null, 2));
    } catch (error) {
        console.log('Error with /api/orders/refund-requests:');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Error data:', error.response.data);
        } else {
            console.log('Error message:', error.message);
        }
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    try {
        // Test /api/orders/transactions/all (authenticated)
        console.log('2. Testing /api/orders/transactions/all (authenticated)');
        const transactionResponse = await axios.get(`${baseURL}/api/orders/transactions/all`, {
            timeout: 10000
        });
        console.log('Status:', transactionResponse.status);
        console.log('Data:', JSON.stringify(transactionResponse.data, null, 2));
    } catch (error) {
        console.log('Error with /api/orders/transactions/all:');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Error data:', error.response.data);
        } else {
            console.log('Error message:', error.message);
        }
    }
}

testAuthEndpoints().then(() => {
    console.log('\nAuth endpoint tests completed');
    process.exit(0);
}).catch(error => {
    console.error('Test script error:', error);
    process.exit(1);
});
