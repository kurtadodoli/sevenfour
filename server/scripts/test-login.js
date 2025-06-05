const axios = require('axios');

async function testLogin() {
    try {
        console.log('\n🔄 Testing login...');
        
        const response = await axios.post('http://localhost:5001/api/auth/login', {
            email: 'test@example.com',
            password: 'Test123!@#'
        });

        console.log('✅ Login successful!');
        console.log('Token:', response.data.token);
        console.log('User:', response.data.user);

    } catch (error) {
        console.error('❌ Login failed:', error.response?.data || error.message);
    }
}

testLogin();