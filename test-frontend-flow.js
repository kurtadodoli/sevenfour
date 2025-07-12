const axios = require('axios');

async function testFrontendFlow() {
  console.log('🎯 TESTING FRONTEND CALENDAR FLOW');
  console.log('=================================');
  
  try {
    // Step 1: Fetch calendar data like the frontend does
    console.log('📡 1. Fetching calendar data from API...');
    const response = await axios.get('http://localhost:5000/api/delivery-enhanced/calendar', {
      params: { year: 2025, month: 7 }
    });
    
    console.log(`✅ API returned ${response.data.data.calendar.length} calendar entries`);
    
    // Step 2: Flatten the structure like the frontend should do
    console.log('\n🔧 2. Flattening calendar structure...');
    const calendarData = response.data.data;
    const allDeliveries = [];
    
    if (calendarData.calendar && Array.isArray(calendarData.calendar)) {
      calendarData.calendar.forEach(calendarEntry => {
        if (calendarEntry.deliveries && Array.isArray(calendarEntry.deliveries)) {
          allDeliveries.push(...calendarEntry.deliveries);
        }
      });
    }
    
    console.log(`✅ Flattened to ${allDeliveries.length} total deliveries:`);
    allDeliveries.forEach(delivery => {
      console.log(`  • ${delivery.delivery_date}: Order ${delivery.order_number} (ID: ${delivery.order_id}), Status: ${delivery.delivery_status}`);
    });
    
    // Step 3: Test filtering logic
    console.log('\n🔍 3. Testing filter logic...');
    const sampleOrderIds = [
      1001, 1002, 1005, 9999, 123, 1006, 999999, 5615, 5515, 3,
      100, 101, 102, 200, 300, 400, 500,
      1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000,
      99999, 88888, 77777, 66666, 55555, 44444, 33333, 22222, 11111,
      26, 27, 28, 29, 30
    ];
    
    const filteredDeliveries = allDeliveries.filter(schedule => {
      return !sampleOrderIds.includes(parseInt(schedule.order_id));
    });
    
    console.log(`✅ After filtering: ${filteredDeliveries.length} deliveries remaining:`);
    filteredDeliveries.forEach(delivery => {
      console.log(`  • ${delivery.delivery_date}: Order ${delivery.order_number} (ID: ${delivery.order_id}), Status: ${delivery.delivery_status}`);
    });
    
    // Step 4: Test date matching for July 7th
    console.log('\n📅 4. Testing date matching for July 7, 2025...');
    const july7 = new Date('2025-07-07');
    
    const july7Deliveries = filteredDeliveries.filter(schedule => {
      const scheduleDate = new Date(schedule.delivery_date);
      return scheduleDate.getFullYear() === july7.getFullYear() &&
             scheduleDate.getMonth() === july7.getMonth() &&
             scheduleDate.getDate() === july7.getDate();
    });
    
    console.log(`✅ July 7th deliveries found: ${july7Deliveries.length}`);
    july7Deliveries.forEach(delivery => {
      console.log(`  • Order ${delivery.order_number}, Status: ${delivery.delivery_status}`);
    });
    
    // Step 5: Determine icon that should appear
    console.log('\n🎨 5. Determining calendar icon...');
    if (july7Deliveries.length > 0) {
      const delivery = july7Deliveries[0];
      let icon = '⏳'; // Default
      
      if (delivery.delivery_status === 'delivered') icon = '✅';
      else if (delivery.delivery_status === 'in_transit') icon = '🚚';
      else if (delivery.delivery_status === 'delayed') icon = '⚠️';
      else if (delivery.delivery_status === 'cancelled') icon = '❌';
      else if (delivery.delivery_status === 'scheduled') icon = '📅';
      
      console.log(`✅ July 7th should show: ${icon} (Status: ${delivery.delivery_status})`);
    } else {
      console.log('❌ No deliveries found for July 7th - no icon should appear');
    }
    
    console.log('\n🎉 FRONTEND FLOW TEST COMPLETE');
    console.log('==============================');
    console.log('Expected result: Calendar should show delivery icons on:');
    filteredDeliveries.forEach(delivery => {
      const date = new Date(delivery.delivery_date);
      const dateStr = date.toLocaleDateString();
      let icon = '⏳';
      if (delivery.delivery_status === 'delivered') icon = '✅';
      else if (delivery.delivery_status === 'in_transit') icon = '🚚';
      else if (delivery.delivery_status === 'delayed') icon = '⚠️';
      else if (delivery.delivery_status === 'cancelled') icon = '❌';
      else if (delivery.delivery_status === 'scheduled') icon = '📅';
      
      console.log(`  • ${dateStr}: ${icon} (${delivery.delivery_status})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testFrontendFlow();
