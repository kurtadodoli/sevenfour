const axios = require('axios');

async function checkLoginResponse() {
    console.log('🔍 Checking Login Response Structure...\n');
    
    try {
        const response = await axios.post('http://localhost:3001/api/auth/login', {
            email: 'kurtadodoli@gmail.com',
            password: 'password123'
        });
        
        console.log('✅ Login successful!');
        console.log('Full response data:', JSON.stringify(response.data, null, 2));
        
        return response.data;
    } catch (error) {
        console.log('❌ Login failed:', error.response?.data || error.message);
        return null;
    }
}

checkLoginResponse();
