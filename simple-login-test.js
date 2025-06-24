const axios = require('axios');

async function simpleLoginTest() {
    console.log('🔍 Simple Login Test...\n');
    
    try {
        const response = await axios.post('http://localhost:3001/api/auth/login', {
            email: 'kurtadodoli@gmail.com',
            password: 'password123'
        });
        
        console.log('✅ Login successful!');
        console.log('Token:', response.data.token?.substring(0, 50) + '...');
        
        return response.data.token;
    } catch (error) {
        console.log('❌ Login failed:', error.response?.data?.message || error.message);
        return null;
    }
}

simpleLoginTest();
