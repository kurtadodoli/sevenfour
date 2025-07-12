// Get a valid JWT token by logging in
const axios = require('axios');

async function getValidToken() {
    console.log('🔐 Getting valid JWT token...');
    
    try {
        const response = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'test@admin.com',
            password: 'admin123'
        });
        
        console.log('✅ Login successful!');
        console.log('Token:', response.data.data.token);
        return response.data.data.token;
        
    } catch (error) {
        console.error('❌ Login failed:', error.response?.data || error.message);
        return null;
    }
}

getValidToken();
