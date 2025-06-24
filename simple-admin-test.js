const axios = require('axios');

async function simpleAdminTest() {
    console.log('🔍 Simple Admin Test');
    console.log('===================');

    try {
        // Step 1: Login
        console.log('1. Logging in...');
        const response = await axios.post('http://localhost:3001/api/auth/login', {
            email: 'testadmin@example.com',
            password: 'admin123'
        });        console.log('Login response status:', response.status);
        console.log('Login success:', response.data.success);
        console.log('Full response data:', JSON.stringify(response.data, null, 2));
        
        if (response.data.token) {
            console.log('Token exists:', !!response.data.token);
            console.log('Token length:', response.data.token.length);
            console.log('Token starts with:', response.data.token.substring(0, 20));
        } else {
            console.log('❌ No token in response');
            return;
        }

        // Step 2: Test admin endpoint
        console.log('\n2. Testing admin endpoint...');
        const adminResponse = await axios.get('http://localhost:3001/api/admin/user-logs', {
            headers: { 
                'Authorization': `Bearer ${response.data.token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Admin endpoint works:', adminResponse.status);
        console.log('Users count:', adminResponse.data.length);

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

simpleAdminTest();
