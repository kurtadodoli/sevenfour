const axios = require('axios');

async function testMappingResolver() {
    try {
        // First, get the admin token
        console.log('🔍 Getting admin token...');
        
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'kurtadodoli@gmail.com',
            password: 'admin123'
        });
        
        const token = loginResponse.data.token;
        console.log('✅ Got admin token');
        
        // Test the mapping resolver endpoint
        console.log('🔍 Testing mapping resolver...');
        
        const mappingResponse = await axios.get(
            'http://localhost:5000/api/custom-orders/resolve-mapping/CUSTOM-8H-QMZ5R-2498',
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );
        
        console.log('✅ Mapping resolver response:');
        console.log(JSON.stringify(mappingResponse.data, null, 2));
        
        // Test the custom order delivery status update with the resolved ID
        const resolvedId = mappingResponse.data.data.resolved_custom_order_id;
        console.log(`\n🔍 Testing delivery status update with resolved ID: ${resolvedId}`);
        
        const updateResponse = await axios.patch(
            `http://localhost:5000/api/custom-orders/${resolvedId}/delivery-status`,
            {
                delivery_status: 'delivered',
                delivery_notes: 'Test delivery update via resolved mapping'
            },
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );
        
        console.log('✅ Delivery status update response:');
        console.log(JSON.stringify(updateResponse.data, null, 2));
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
        console.error('Status:', error.response?.status);
    }
}

testMappingResolver();
