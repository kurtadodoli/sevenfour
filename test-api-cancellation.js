// Test script to check cancellation requests API
const axios = require('axios');

async function testCancellationRequestsAPI() {
    try {
        console.log('🔄 Testing cancellation requests API...');
        
        // First, we need to login as admin to get a token
        const loginResponse = await axios.post('http://localhost:5000/api/users/login', {
            email: 'testadmin@example.com',
            password: 'admin123'
        });
        
        if (loginResponse.data.success) {
            console.log('✅ Admin login successful');
            const token = loginResponse.data.token;
            
            // Test the cancellation requests endpoint
            const response = await axios.get('http://localhost:5000/api/orders/cancellation-requests', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            console.log('📤 API Response:', {
                success: response.data.success,
                dataLength: response.data.data ? response.data.data.length : 'undefined',
                pagination: response.data.pagination
            });
            
            if (response.data.data && response.data.data.length > 0) {
                console.log('📋 Sample cancellation request:');
                const sample = response.data.data[0];
                console.log({
                    id: sample.id,
                    order_number: sample.order_number,
                    order_id: sample.order_id,
                    has_order_items: !!sample.order_items,
                    order_items_count: sample.order_items ? sample.order_items.length : 0,
                    order_items_sample: sample.order_items ? sample.order_items[0] : null
                });
            } else {
                console.log('📝 No cancellation requests found');
            }
        } else {
            console.log('❌ Admin login failed:', loginResponse.data.message);
        }
        
    } catch (error) {
        console.error('❌ Error testing API:', error.response?.data || error.message);
    }
}

testCancellationRequestsAPI();
