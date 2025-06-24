const axios = require('axios');

async function testDeliveryPageFlow() {
    try {
        console.log('🔄 Testing DeliveryPage.js Integration Flow\n');
        
        // Test 1: Load existing delivery schedules (what DeliveryPage.js does on mount)
        console.log('1. Loading existing delivery schedules...');
        const getResponse = await axios.get('http://localhost:3001/api/delivery/schedules');
        
        console.log(`✅ Found ${getResponse.data.length} existing schedules`);
        console.log(`✅ Response is array: ${Array.isArray(getResponse.data)}`);
        
        // Show the format DeliveryPage.js expects
        if (getResponse.data.length > 0) {
            const sample = getResponse.data[0];
            console.log('✅ Sample schedule format:', {
                id: sample.id,
                order_id: sample.order_id,
                delivery_date: sample.delivery_date,
                delivery_time_slot: sample.delivery_time_slot,
                delivery_status: sample.delivery_status
            });
        }
        
        // Test 2: Create a new delivery schedule (what happens when user schedules)
        console.log('\n2. Creating new delivery schedule...');        const testSchedule = {
            order_id: Math.floor(Math.random() * 9999) + 2000, // Random order ID between 2000-11999
            order_type: 'regular',
            customer_id: 967502321335185,
            delivery_date: '2025-06-27',
            delivery_time_slot: '9:00-12:00',
            delivery_address: 'Test Address for Flow Validation',
            delivery_city: 'Manila',
            delivery_postal_code: '1000',
            delivery_province: 'Metro Manila',
            delivery_contact_phone: '+63-920-111-2222',
            delivery_notes: 'Test delivery for DeliveryPage.js integration',
            priority_level: 'normal',
            delivery_fee: 150.00
        };
        
        const postResponse = await axios.post('http://localhost:3001/api/delivery/schedules', testSchedule);
        console.log(`✅ Created schedule with ID: ${postResponse.data.schedule.id}`);
        console.log(`✅ Generated tracking number: ${postResponse.data.tracking_number}`);
        
        // Test 3: Verify persistence (simulate page refresh)
        console.log('\n3. Simulating page refresh - reloading schedules...');
        const getResponse2 = await axios.get('http://localhost:3001/api/delivery/schedules');
        
        const newSchedule = getResponse2.data.find(s => s.id === postResponse.data.schedule.id);
        if (newSchedule) {
            console.log('✅ Schedule persisted correctly after "page refresh"');
            console.log('✅ Persisted data:', {
                id: newSchedule.id,
                order_id: newSchedule.order_id,
                delivery_date: newSchedule.delivery_date,
                delivery_time_slot: newSchedule.delivery_time_slot,
                delivery_status: newSchedule.delivery_status,
                tracking_number: newSchedule.tracking_number
            });
        } else {
            console.log('❌ Schedule was not persisted!');
            return;
        }
        
        console.log('\n🎉 SUCCESS! DeliveryPage.js delivery schedule persistence is now working!');
        console.log('\n📋 Summary:');
        console.log('   • GET /api/delivery/schedules returns array ✅');
        console.log('   • POST /api/delivery/schedules creates and saves ✅');
        console.log('   • Schedules persist after page refresh ✅');
        console.log('   • Database connection is working ✅');
        console.log('   • Backend API is properly connected ✅');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

testDeliveryPageFlow();
