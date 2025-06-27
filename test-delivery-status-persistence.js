// Test script to verify DeliveryPage status persistence
// This script tests the backend API endpoints to ensure status changes persist

const testDeliveryStatusPersistence = async () => {
  const baseURL = 'http://localhost:5000';
  
  try {
    // 1. First get all delivery schedules to see current state
    console.log('📋 Fetching current delivery schedules...');
    const schedulesResponse = await fetch(`${baseURL}/delivery/schedules`);
    const schedulesData = await schedulesResponse.json();
    
    if (schedulesData.success && schedulesData.schedules.length > 0) {
      const firstSchedule = schedulesData.schedules[0];
      console.log('✅ Found schedule to test:', {
        id: firstSchedule.id,
        order_id: firstSchedule.order_id,
        current_status: firstSchedule.delivery_status,
        delivery_date: firstSchedule.delivery_date
      });
      
      // 2. Update the status to 'in_transit'
      console.log('🚛 Updating status to "in_transit"...');
      const updateResponse = await fetch(`${baseURL}/delivery/schedules/${firstSchedule.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          delivery_status: 'in_transit',
          delivery_notes: 'Status update test - changed to in_transit at ' + new Date().toISOString()
        })
      });
      
      const updateData = await updateResponse.json();
      if (updateData.success) {
        console.log('✅ Status update successful:', updateData.schedule.delivery_status);
        
        // 3. Fetch the schedule again to verify persistence
        console.log('🔍 Verifying persistence...');
        const verifyResponse = await fetch(`${baseURL}/delivery/schedules`);
        const verifyData = await verifyResponse.json();
        
        const updatedSchedule = verifyData.schedules.find(s => s.id === firstSchedule.id);
        if (updatedSchedule && updatedSchedule.delivery_status === 'in_transit') {
          console.log('✅ Status persistence verified! Status is now:', updatedSchedule.delivery_status);
          console.log('📝 Notes:', updatedSchedule.delivery_notes);
          return true;
        } else {
          console.error('❌ Status did not persist correctly');
          return false;
        }
      } else {
        console.error('❌ Status update failed:', updateData.message);
        return false;
      }
    } else {
      console.log('⚠️ No delivery schedules found to test');
      return false;
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
};

// Run the test
testDeliveryStatusPersistence()
  .then(success => {
    if (success) {
      console.log('🎉 Delivery status persistence test PASSED');
    } else {
      console.log('💥 Delivery status persistence test FAILED');
    }
  })
  .catch(error => {
    console.error('💥 Test error:', error);
  });
