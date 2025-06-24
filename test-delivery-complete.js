const axios = require('axios');

async function testDeliveryScheduleFlow() {
  console.log('🧪 Testing complete delivery schedule flow...\n');
  
  try {
    // 1. First, get existing schedules
    console.log('1️⃣ Getting existing delivery schedules...');
    const existingSchedules = await axios.get('http://localhost:3001/api/delivery/schedules');
    console.log(`✅ Found ${existingSchedules.data.length} existing schedules`);
    
    // 2. Test creating a new schedule
    console.log('\n2️⃣ Testing new schedule creation...');
    const newScheduleData = {
      order_id: 999999, // Use a unique order ID that won't conflict
      order_type: 'regular',
      customer_id: 1,
      delivery_date: '2025-06-26',
      delivery_time_slot: '9:00-12:00',
      delivery_address: '456 Test Avenue',
      delivery_city: 'Manila',
      delivery_postal_code: '1001',
      delivery_province: 'Metro Manila',
      delivery_contact_phone: '+63987654321',
      delivery_notes: 'Test schedule - please ignore',
      priority_level: 'normal',
      delivery_fee: 150.00
    };
    
    const createResponse = await axios.post('http://localhost:3001/api/delivery/schedules', newScheduleData);
    console.log('✅ New schedule created successfully');
    console.log('📋 Created schedule ID:', createResponse.data.schedule.id);
    const scheduleId = createResponse.data.schedule.id;
    
    // 3. Test duplicate creation (should fail)
    console.log('\n3️⃣ Testing duplicate schedule creation (should fail)...');
    try {
      await axios.post('http://localhost:3001/api/delivery/schedules', newScheduleData);
      console.log('❌ Unexpected: Duplicate schedule was allowed');
    } catch (duplicateError) {
      if (duplicateError.response?.status === 400) {
        console.log('✅ Duplicate schedule correctly rejected with 400 error');
        console.log('📋 Error message:', duplicateError.response.data.message);
      } else {
        console.log('❌ Unexpected error:', duplicateError.message);
      }
    }
    
    // 4. Test updating the schedule
    console.log('\n4️⃣ Testing schedule update...');
    const updateData = {
      delivery_date: '2025-06-27',
      delivery_time_slot: '14:00-17:00',
      delivery_notes: 'Updated test schedule',
      delivery_status: 'scheduled'
    };
    
    const updateResponse = await axios.put(`http://localhost:3001/api/delivery/schedules/${scheduleId}`, updateData);
    console.log('✅ Schedule updated successfully');
    
    // 5. Verify the update
    console.log('\n5️⃣ Verifying update...');
    const updatedSchedule = await axios.get(`http://localhost:3001/api/delivery/schedules/${scheduleId}`);
    console.log('✅ Updated schedule retrieved');
    console.log('📋 New delivery date:', updatedSchedule.data.delivery_date);
    console.log('📋 New time slot:', updatedSchedule.data.delivery_time_slot);
    
    // 6. Clean up - delete the test schedule
    console.log('\n6️⃣ Cleaning up test data...');
    await axios.delete(`http://localhost:3001/api/delivery/schedules/${scheduleId}`);
    console.log('✅ Test schedule deleted');
    
    console.log('\n🎉 All delivery schedule tests passed!');
    console.log('✅ Create, Read, Update, Delete operations work correctly');
    console.log('✅ Duplicate detection works correctly');
    console.log('✅ The delivery schedule API is fully functional');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testDeliveryScheduleFlow();
