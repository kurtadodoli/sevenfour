const axios = require('axios');

async function testInventoryRoute() {
    try {
        console.log('Testing inventory route...');
        
        // First, test if server is running
        const healthCheck = await axios.get('http://localhost:5002/api/products');
        console.log('✓ Server is running');
        
        // Test the inventory route
        const response = await axios.get('http://localhost:5002/api/products/admin/inventory', {
            headers: {
                'Authorization': 'Bearer your-admin-token' // You may need to update this
            }
        });
        
        console.log('✓ Inventory route is working');
        console.log('Response data:', response.data);
        
    } catch (error) {
        if (error.response) {
            console.log('❌ Route error:', error.response.status, error.response.statusText);
            console.log('Error data:', error.response.data);
        } else if (error.code === 'ECONNREFUSED') {
            console.log('❌ Server is not running. Please start the server first.');
        } else {
            console.log('❌ Error:', error.message);
        }
    }
}

testInventoryRoute();
