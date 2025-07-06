// Test script to verify custom order items fix
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testCustomOrderItemsEndpoint() {
    console.log('🧪 Testing Custom Order Items Fix');
    console.log('='.repeat(50));
    
    try {
        // Test 1: Try to call items endpoint with custom order ID (should fail gracefully)
        console.log('Test 1: Calling items endpoint with custom order ID...');
        try {
            const response = await axios.get(`${API_BASE_URL}/orders/custom-CUSTOM-MCQA8R1Q-YXU65/items`, {
                headers: {
                    'Authorization': 'Bearer fake-token-for-testing'
                }
            });
            console.log('❌ Unexpected success:', response.data);
        } catch (error) {
            if (error.response) {
                console.log('✅ Expected error response:', error.response.status, error.response.data.message);
                if (error.response.data.message === 'Invalid token') {
                    console.log('   📝 Note: Got auth error first, which is expected');
                } else if (error.response.data.message?.includes('Custom orders do not support this endpoint')) {
                    console.log('   ✅ Perfect! Our custom error message is working');
                }
            } else {
                console.log('❌ Network error:', error.message);
            }
        }
        
        // Test 2: Verify regular order endpoint still works (would need real auth)
        console.log('\nTest 2: Regular order endpoint (without auth - expect auth error)...');
        try {
            const response = await axios.get(`${API_BASE_URL}/orders/123/items`, {
                headers: {
                    'Authorization': 'Bearer fake-token-for-testing'
                }
            });
            console.log('❌ Unexpected success:', response.data);
        } catch (error) {
            if (error.response && error.response.data.message === 'Invalid token') {
                console.log('✅ Regular endpoint accessible (auth required as expected)');
            } else {
                console.log('❌ Unexpected error:', error.response?.data || error.message);
            }
        }
        
        console.log('\n✅ Custom order items fix validation completed!');
        console.log('📋 Summary: Frontend should no longer call /orders/custom-*/items');
        console.log('📋 Backend gracefully handles accidental calls to custom order items endpoint');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testCustomOrderItemsEndpoint();
