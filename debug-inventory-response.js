const axios = require('axios');

async function debugInventoryResponse() {
    try {
        console.log('🔍 Debugging Raw Inventory API Response...\n');
        
        const response = await axios.get('http://localhost:3001/api/inventory/overview-test');
        const result = response.data;
        
        console.log('Raw Response:');
        console.log(JSON.stringify(result, null, 2));
        
    } catch (error) {
        console.log('❌ Error:', error.message);
        if (error.response) {
            console.log('Response data:', error.response.data);
        }
    }
}

debugInventoryResponse();
