const axios = require('axios');

async function testRealAPI() {
    try {
        console.log('🔍 Testing the actual API flow...');
        
        // Step 1: Get admin login
        console.log('🔐 Logging in as admin...');
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'testadmin@example.com', 
            password: 'admin123'
        });
        
        const token = loginResponse.data.data.token;
        console.log('✅ Admin login successful');
        console.log('Token received:', token ? 'Present' : 'Missing');
        
        // Step 2: Check current custom order status
        console.log('\n📋 Getting current custom order status...');
        const currentStatus = await axios.get('http://localhost:5000/api/custom-orders/CUSTOM-MCED998H-QMZ5R', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('Current order status:', {
            id: currentStatus.data.data.id,
            custom_order_id: currentStatus.data.data.custom_order_id,
            delivery_status: currentStatus.data.data.delivery_status
        });
        
        // Step 3: Test updating delivery status to 'scheduled' (what should happen when production start is set)
        console.log('\n🔄 Testing delivery status update to "scheduled"...');
        const scheduledResponse = await axios.patch(
            'http://localhost:5000/api/custom-orders/4/delivery-status',
            {
                delivery_status: 'scheduled',
                delivery_notes: 'Production timeline set - testing API'
            },
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );
        
        console.log('✅ Scheduled update response:', scheduledResponse.data);
        
        // Step 4: Test updating to 'delivered' (what should happen when Delivered button is clicked)
        console.log('\n🚚 Testing delivery status update to "delivered"...');
        const deliveredResponse = await axios.patch(
            'http://localhost:5000/api/custom-orders/4/delivery-status',
            {
                delivery_status: 'delivered',
                delivery_notes: 'Testing delivered button functionality'
            },
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );
        
        console.log('✅ Delivered update response:', deliveredResponse.data);
        
        // Step 5: Verify final status
        console.log('\n📋 Verifying final status...');
        const finalStatus = await axios.get('http://localhost:5000/api/custom-orders/CUSTOM-MCED998H-QMZ5R', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('Final order status:', {
            delivery_status: finalStatus.data.data.delivery_status,
            delivery_notes: finalStatus.data.data.delivery_notes
        });
        
        console.log('\n✅ API testing completed successfully!');
        console.log('🎯 Both scheduled and delivered status updates work at API level.');
        
    } catch (error) {
        console.error('❌ API Error:', error.response?.data || error.message);
        console.error('Status:', error.response?.status);
        if (error.response?.status === 401) {
            console.log('🔑 Try different admin credentials');
        }
    }
}

testRealAPI();
