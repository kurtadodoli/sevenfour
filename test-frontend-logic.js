// Test the updated frontend detection logic
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:5000',
  timeout: 10000,
});

async function testFrontendDetectionLogic() {
  console.log('🧪 Testing updated frontend detection logic...\n');
  
  try {
    // Simulate the frontend logic
    let deliveryCounts = {};
    
    // Method 1: Check original delivery schedules (what backend deletion checks)
    console.log('📊 Testing /delivery/schedules...');
    try {
      const schedulesResponse = await api.get('/delivery/schedules');
      const schedules = Array.isArray(schedulesResponse.data) ? schedulesResponse.data : schedulesResponse.data.schedules || [];
      
      console.log(`  ✅ Found ${schedules.length} schedules`);
      console.log('  📊 Response structure:', {
        isArray: Array.isArray(schedulesResponse.data),
        hasSuccess: 'success' in schedulesResponse.data,
        hasSchedules: 'schedules' in schedulesResponse.data,
        schedulesLength: schedules.length
      });
      
      schedules.forEach(schedule => {
        // Include all active delivery statuses to match backend logic
        const activeStatuses = ['pending', 'scheduled', 'in_transit', 'delayed'];
        const status = schedule.delivery_status || schedule.status;
        
        console.log(`  📦 Schedule ${schedule.id}: Courier ${schedule.courier_id}, Status: ${status}`);
        
        if (schedule.courier_id && status && activeStatuses.includes(status.toLowerCase())) {
          deliveryCounts[schedule.courier_id] = (deliveryCounts[schedule.courier_id] || 0) + 1;
          console.log(`    ✅ ACTIVE delivery for courier ${schedule.courier_id}: ${status}`);
        }
      });
    } catch (scheduleError) {
      console.log('  ❌ /delivery/schedules failed:', scheduleError.response?.status || scheduleError.message);
    }
    
    // Method 2: Check enhanced delivery orders
    console.log('\n📊 Testing /delivery-enhanced/orders...');
    try {
      const ordersResponse = await api.get('/api/delivery-enhanced/orders');
      if (ordersResponse.data.success && ordersResponse.data.data) {
        const orders = ordersResponse.data.data;
        console.log(`  ✅ Found ${orders.length} enhanced orders`);
        
        orders.forEach(order => {
          const activeStatuses = ['pending', 'scheduled', 'in_transit', 'delayed'];
          const status = order.delivery_status || order.status;
          
          if (order.courier_id && status && activeStatuses.includes(status.toLowerCase())) {
            deliveryCounts[order.courier_id] = (deliveryCounts[order.courier_id] || 0) + 1;
            console.log(`    ✅ ACTIVE order for courier ${order.courier_id}: ${status}`);
          }
        });
      }
    } catch (ordersError) {
      console.log('  ❌ /delivery-enhanced/orders failed:', ordersError.response?.status || ordersError.message);
    }
    
    console.log('\n📊 Final frontend detection results:', deliveryCounts);
    
    // Now test courier deletion
    console.log('\n🧪 Testing courier 4 deletion...');
    const courier4ActiveCount = deliveryCounts[4] || 0;
    console.log(`Frontend detected ${courier4ActiveCount} active deliveries for courier 4`);
    
    if (courier4ActiveCount > 0) {
      console.log('✅ Frontend will now properly warn about active deliveries before deletion attempt');
    } else {
      console.log('❌ Frontend still not detecting active deliveries - backend will reject deletion');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testFrontendDetectionLogic().then(() => {
  console.log('\n✅ Test complete');
}).catch(error => {
  console.error('❌ Test failed:', error);
});
