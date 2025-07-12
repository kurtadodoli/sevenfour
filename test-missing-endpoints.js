// Test script to check if the missing endpoints are now available
const axios = require('axios');

async function testEndpoints() {
    console.log('🔍 Testing API endpoints...');
    
    const baseURL = 'http://localhost:5000/api';
    
    // Test endpoints
    const endpoints = [
        '/orders/rejected-payments',
        '/custom-orders/cancellation-requests'
    ];
    
    for (const endpoint of endpoints) {
        try {
            console.log(`\n📡 Testing: ${baseURL}${endpoint}`);
            
            const response = await axios.get(`${baseURL}${endpoint}`, {
                headers: {
                    'Authorization': 'Bearer dummy-token' // This will fail auth but should reach the endpoint
                }
            });
            
            console.log(`✅ ${endpoint}: Status ${response.status}`);
            
        } catch (error) {
            if (error.response) {
                console.log(`🔍 ${endpoint}: Status ${error.response.status} - ${error.response.statusText}`);
                
                if (error.response.status === 401) {
                    console.log(`   ✅ Endpoint exists (auth required)`);
                } else if (error.response.status === 403) {
                    console.log(`   ✅ Endpoint exists (admin required)`);
                } else if (error.response.status === 404) {
                    console.log(`   ❌ Endpoint not found`);
                } else {
                    console.log(`   🔍 Other response: ${error.response.data?.message || 'Unknown'}`);
                }
            } else if (error.code === 'ECONNREFUSED') {
                console.log(`   ❌ Server not running`);
            } else {
                console.log(`   ❌ Error: ${error.message}`);
            }
        }
    }
    
    console.log('\n🏁 Test completed');
}

testEndpoints();
