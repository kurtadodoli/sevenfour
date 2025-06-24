// Test script to validate client-side API calls
const axios = require('axios');

// Create axios instance with the same configuration as the client
const api = axios.create({
    baseURL: 'http://localhost:3001/api',
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

async function testClientAPI() {
    console.log('🧪 Testing client-side API configuration...');
    
    try {
        // Test GET /delivery/schedules (without /api prefix, as fixed)
        console.log('\n📥 Testing GET /delivery/schedules...');
        const response = await api.get('/delivery/schedules');
        console.log(`✅ Success! Status: ${response.status}`);
        console.log(`✅ Found ${response.data.length} delivery schedules`);
        
        // Test POST /delivery/schedules (without /api prefix, as fixed)
        console.log('\n📤 Testing POST /delivery/schedules...');
        const testDelivery = {
            order_id: 9999,
            order_type: 'regular',
            customer_id: 967502321335185,
            delivery_date: '2025-06-25',
            delivery_time_slot: '2:00-5:00',
            delivery_address: 'Test Address from Client Fix',
            delivery_city: 'Manila',
            delivery_postal_code: '1000',
            delivery_province: 'Metro Manila',
            delivery_contact_phone: '+63-999-888-7777',
            delivery_notes: 'Test delivery from client-side fix validation',
            priority_level: 'normal',
            delivery_fee: 150.00
        };
        
        const postResponse = await api.post('/delivery/schedules', testDelivery);
        console.log(`✅ POST Success! Status: ${postResponse.status}`);
        console.log(`✅ Created delivery schedule with ID: ${postResponse.data.schedule?.id}`);
        console.log(`✅ Tracking number: ${postResponse.data.tracking_number}`);
        
        // Test PUT /delivery/schedules/:id (without /api prefix, as fixed)
        if (postResponse.data.schedule?.id) {
            console.log(`\n📝 Testing PUT /delivery/schedules/${postResponse.data.schedule.id}...`);
            const updateData = {
                delivery_status: 'in_transit',
                delivery_notes: 'Updated from client fix test'
            };
            
            const putResponse = await api.put(`/delivery/schedules/${postResponse.data.schedule.id}`, updateData);
            console.log(`✅ PUT Success! Status: ${putResponse.status}`);
            console.log(`✅ Updated delivery schedule status`);
            
            // Test DELETE /delivery/schedules/:id (without /api prefix, as fixed)
            console.log(`\n🗑️ Testing DELETE /delivery/schedules/${postResponse.data.schedule.id}...`);
            const deleteResponse = await api.delete(`/delivery/schedules/${postResponse.data.schedule.id}`);
            console.log(`✅ DELETE Success! Status: ${deleteResponse.status}`);
            console.log(`✅ Deleted test delivery schedule`);
        }
        
        console.log('\n🎉 All client-side API tests passed!');
        console.log('🎯 The fix is working correctly. The client will now use:');
        console.log('   • /delivery/schedules instead of /api/delivery/schedules');
        console.log('   • Base URL: http://localhost:3001/api');
        console.log('   • Final URLs: http://localhost:3001/api/delivery/schedules');
        
    } catch (error) {
        console.error('❌ Client API Test Failed:', error.response?.status || error.message);
        if (error.response?.data) {
            console.error('Error details:', error.response.data);
        }
    }
}

testClientAPI();
