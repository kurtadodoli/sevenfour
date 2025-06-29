// Test script to verify active delivery detection
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
});

async function testActiveDeliveryDetection() {
  console.log('🧪 Testing active delivery detection logic...\n');
  
  try {
    // Test Method 1: Enhanced delivery orders
    console.log('📊 Testing /delivery-enhanced/orders...');
    const ordersResponse = await api.get('/delivery-enhanced/orders');
    
    if (ordersResponse.data.success && ordersResponse.data.data) {
      const orders = ordersResponse.data.data;
      console.log(`  ✅ Found ${orders.length} orders`);
      
      const deliveryCounts = {};
      const activeStatuses = ['pending', 'scheduled', 'in_transit', 'delayed'];
      
      orders.forEach(order => {
        const status = order.delivery_status || order.status;
        console.log(`  📦 Order ${order.order_id || order.id}: Courier ${order.courier_id}, Status: ${status}`);
        
        if (order.courier_id && status && activeStatuses.includes(status.toLowerCase())) {
          deliveryCounts[order.courier_id] = (deliveryCounts[order.courier_id] || 0) + 1;
          console.log(`    ✅ ACTIVE delivery for courier ${order.courier_id}`);
        }
      });
      
      console.log('  📊 Enhanced orders active delivery counts:', deliveryCounts);
    } else {
      console.log('  ❌ No enhanced orders data');
    }
    
    // Test Method 2: Original delivery schedules
    console.log('\n📊 Testing /delivery/schedules...');
    try {
      const schedulesResponse = await api.get('/delivery/schedules');
      
      if (schedulesResponse.data.success && schedulesResponse.data.data) {
        const schedules = schedulesResponse.data.data;
        console.log(`  ✅ Found ${schedules.length} schedules`);
        
        const deliveryCounts2 = {};
        const activeStatuses = ['pending', 'scheduled', 'in_transit', 'delayed'];
        
        schedules.forEach(schedule => {
          const status = schedule.delivery_status || schedule.status;
          console.log(`  📦 Schedule ${schedule.id}: Courier ${schedule.courier_id}, Status: ${status}`);
          
          if (schedule.courier_id && status && activeStatuses.includes(status.toLowerCase())) {
            deliveryCounts2[schedule.courier_id] = (deliveryCounts2[schedule.courier_id] || 0) + 1;
            console.log(`    ✅ ACTIVE delivery for courier ${schedule.courier_id}`);
          }
        });
        
        console.log('  📊 Original schedules active delivery counts:', deliveryCounts2);
      } else {
        console.log('  ❌ No schedules data');
      }
    } catch (schedError) {
      console.log('  ❌ /delivery/schedules failed:', schedError.response?.status || schedError.message);
    }
    
    // Test courier deletion for courier 4
    console.log('\n🧪 Testing courier deletion for courier 4...');
    try {
      const deleteResponse = await api.delete('/couriers/4');
      console.log('  ✅ Deletion successful:', deleteResponse.data);
    } catch (deleteError) {
      console.log('  ❌ Deletion failed:', deleteError.response?.status, deleteError.response?.data?.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testActiveDeliveryDetection().then(() => {
  console.log('\n✅ Test complete');
}).catch(error => {
  console.error('❌ Test failed:', error);
});
