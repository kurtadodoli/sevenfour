const axios = require('axios');

async function testJulyCalendar() {
  try {
    console.log('🗓️ Testing Calendar API for July 2025...\n');
    
    const response = await axios.get('http://localhost:5000/api/delivery-enhanced/calendar?year=2025&month=7');
    
    if (response.data.success) {
      const calendarData = response.data.data.calendar;
      
      console.log(`Found ${calendarData.length} calendar entries for July 2025`);
      
      // Look for July 1st specifically
      const july1 = calendarData.find(day => {
        const date = new Date(day.calendar_date);
        return date.getDate() === 1 && date.getMonth() === 6; // July is month 6 (0-indexed)
      });
      
      if (july1) {
        console.log('\n📅 July 1, 2025 Calendar Entry:');
        console.log(`  Date: ${new Date(july1.calendar_date).toLocaleDateString()}`);
        console.log(`  Scheduled Deliveries: ${july1.scheduled_deliveries}`);
        
        if (july1.deliveries && july1.deliveries.length > 0) {
          console.log(`\n  📦 Deliveries on July 1st:`);
          july1.deliveries.forEach((delivery, index) => {
            console.log(`    ${index + 1}. Order ID: ${delivery.order_id}`);
            console.log(`       Order Type: ${delivery.order_type || 'Unknown'}`);
            console.log(`       Delivery Status: ${delivery.delivery_status || 'Unknown'}`);
            console.log(`       Time Slot: ${delivery.delivery_time_slot || 'None'}`);
            
            // Check if this is our custom order
            if (delivery.order_id === 3 || delivery.order_type?.includes('custom')) {
              console.log(`       🎨 THIS IS A CUSTOM ORDER!`);
            }
            console.log('');
          });
        } else {
          console.log('  ❌ No deliveries found in calendar data for July 1st');
        }
      } else {
        console.log('❌ July 1, 2025 not found in calendar data');
      }
      
      // Check for all custom orders in July
      console.log('\n🎨 Checking all July dates for custom orders...');
      let customOrdersFound = 0;
      
      calendarData.forEach(day => {
        if (day.deliveries && day.deliveries.length > 0) {
          day.deliveries.forEach(delivery => {
            if (delivery.order_type && delivery.order_type.includes('custom')) {
              customOrdersFound++;
              const date = new Date(day.calendar_date);
              console.log(`  📅 ${date.toLocaleDateString()}: Custom order (ID: ${delivery.order_id}, Type: ${delivery.order_type})`);
            }
          });
        }
      });
      
      if (customOrdersFound === 0) {
        console.log('  ❌ No custom orders found in any July calendar entries');
      } else {
        console.log(`  ✅ Found ${customOrdersFound} custom orders in July calendar`);
      }
      
    } else {
      console.log('❌ Calendar API returned error:', response.data.message);
    }
    
  } catch (error) {
    console.error('❌ Error testing calendar API:', error.message);
  }
}

testJulyCalendar();
