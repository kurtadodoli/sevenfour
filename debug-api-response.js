const axios = require('axios');

async function debugAPI() {
    try {
        console.log('=== DEBUGGING API RESPONSE ===\n');

        const response = await axios.get('http://localhost:5000/api/delivery-enhanced/orders');
        console.log('Full response structure:');
        console.log(JSON.stringify(response.data, null, 2));

    } catch (error) {
        console.error('❌ API Error:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

debugAPI();
