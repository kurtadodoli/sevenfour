const axios = require('axios');

async function testRefundRequestsAPI() {
    try {
        console.log('Testing refund requests API endpoint...');
        
        // First, let's create a test admin token by logging in
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'admin@example.com',  // Adjust based on your admin user
            password: 'admin123'         // Adjust based on your admin password
        });
        
        const token = loginResponse.data.token;
        console.log('Admin login successful, token obtained');
        
        // Now test the refund requests endpoint
        const response = await axios.get('http://localhost:5000/api/orders/refund-requests', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Refund requests API response:');
        console.log('Status:', response.status);
        console.log('Data:', JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.error('Error testing refund requests API:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

testRefundRequestsAPI();
