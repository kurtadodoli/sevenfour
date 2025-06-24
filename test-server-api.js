const axios = require('axios');

async function testServerAPI() {
    console.log('🌐 Testing Server API Endpoints...');
    
    const baseURL = 'http://localhost:3001';
    
    try {
        // Test 1: Check if server is running
        console.log('\n🔍 Test 1: Checking if server is running...');
        try {
            const healthCheck = await axios.get(`${baseURL}/health`, { timeout: 5000 });
            console.log('✅ Server is running');
        } catch (error) {
            if (error.code === 'ECONNREFUSED') {
                console.log('❌ Server is not running');
                console.log('💡 Please start the server with: cd server && npm start');
                return;
            }
        }

        // Test 2: Check delivery API endpoint
        console.log('\n🔍 Test 2: Testing delivery schedules endpoint...');
        try {
            const response = await axios.get(`${baseURL}/api/delivery/schedules`, { timeout: 10000 });
            console.log('✅ Delivery API endpoint accessible');
            console.log('📊 Response status:', response.status);
            console.log('📊 Response data type:', Array.isArray(response.data) ? 'Array' : typeof response.data);
            console.log('📊 Number of schedules:', Array.isArray(response.data) ? response.data.length : 'N/A');
            
            if (Array.isArray(response.data) && response.data.length > 0) {
                console.log('📋 Sample schedule:');
                console.log(JSON.stringify(response.data[0], null, 2));
            }
        } catch (apiError) {
            console.log('❌ Delivery API endpoint failed');
            console.log('Error:', apiError.message);
            if (apiError.response) {
                console.log('Status:', apiError.response.status);
                console.log('Data:', apiError.response.data);
            }
        }

        // Test 3: Try to create a test delivery schedule
        console.log('\n🔍 Test 3: Testing delivery schedule creation...');
        try {
            const testData = {
                order_id: 8888,
                order_type: 'regular',
                customer_id: 967502321335185,
                delivery_date: '2025-06-26',
                delivery_time_slot: '9:00-12:00',
                delivery_address: 'Test API Address 456',
                delivery_city: 'Manila',
                delivery_postal_code: '1000',
                delivery_province: 'Metro Manila',
                delivery_contact_phone: '+63-888-888-8888',
                delivery_notes: 'Test delivery via API',
                priority_level: 'normal',
                delivery_fee: 150.00
            };

            const createResponse = await axios.post(`${baseURL}/api/delivery/schedules`, testData, { timeout: 10000 });
            console.log('✅ Delivery creation successful');
            console.log('📊 Created delivery ID:', createResponse.data?.id);

            // Clean up test data
            if (createResponse.data?.id) {
                await axios.delete(`${baseURL}/api/delivery/schedules/${createResponse.data.id}`, { timeout: 10000 });
                console.log('🧹 Test delivery cleaned up');
            }
        } catch (createError) {
            console.log('❌ Delivery creation failed');
            console.log('Error:', createError.message);
            if (createError.response) {
                console.log('Status:', createError.response.status);
                console.log('Data:', createError.response.data);
            }
        }

        console.log('\n🎉 Server API test completed!');

    } catch (error) {
        console.error('❌ Unexpected error:', error.message);
    }
}

testServerAPI();
