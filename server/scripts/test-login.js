const axios = require('axios');

async function testLogin() {
    try {
        console.log('\n🔄 Testing login...');
          const response = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'admin@sevenfour.com',
            password: 's3v3n-f0ur-cl0thing*'
        });

        console.log('✅ Login successful!');
        console.log('Response data:', response.data);
    } catch (error) {
        console.error('❌ Login failed:', error.response?.data || error.message);
    }
}

testLogin();
