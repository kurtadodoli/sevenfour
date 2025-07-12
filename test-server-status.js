const axios = require('axios');

async function quickServerTest() {
    try {
        const response = await axios.get('http://localhost:5000/api/custom-orders/test');
        console.log('✅ Server is running:', response.data);
    } catch (error) {
        console.log('❌ Server is not responding:', error.message);
    }
}

quickServerTest();
