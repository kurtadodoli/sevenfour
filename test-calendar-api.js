const axios = require('axios');

async function testCalendarAPI() {
  try {
    console.log('🗓️ Testing Calendar API for June 2025...\n');
    
    const response = await axios.get('http://localhost:5000/api/delivery-enhanced/calendar?year=2025&month=6');
    
    if (response.data.success) {
      const calendarData = response.data.data.calendar;
      
      console.log(`Found ${calendarData.length} calendar entries for June 2025`);
      
      // Look for June 30th specifically
      const june30 = calendarData.find(day => {
        const date = new Date(day.calendar_date);
        return date.getDate() === 30 && date.getMonth() === 5; // June is month 5 (0-indexed)
      });
      
      if (june30) {
        console.log('\n📅 June 30, 2025 Calendar Entry:');
        console.log(`  Date: ${new Date(june30.calendar_date).toLocaleDateString()}`);
        console.log(`  Scheduled Deliveries: ${june30.scheduled_deliveries}`);
        console.log(`  Is Available: ${june30.is_available ? 'Yes' : 'No'}`);
        console.log(`  Max Deliveries: ${june30.max_deliveries}`);
        console.log(`  Current Bookings: ${june30.current_bookings}`);
        
        if (june30.deliveries && june30.deliveries.length > 0) {
          console.log(`\n  📦 Deliveries on June 30th:`);
          june30.deliveries.forEach((delivery, index) => {
            console.log(`    ${index + 1}. Order ID: ${delivery.order_id}`);
            console.log(`       Order Type: ${delivery.order_type || 'Unknown'}`);
            console.log(`       Delivery Status: ${delivery.delivery_status || 'Unknown'}`);
            console.log(`       Time Slot: ${delivery.delivery_time_slot || 'None'}`);
            console.log('');
          });
        } else {
          console.log('  ❌ No deliveries found in calendar data for June 30th');
        }
      } else {
        console.log('❌ June 30, 2025 not found in calendar data');
      }
      
      // Check for any deliveries containing custom orders
      console.log('\n🎨 Checking all June dates for custom orders...');
      let customOrdersFound = 0;
      
      calendarData.forEach(day => {
        if (day.deliveries && day.deliveries.length > 0) {
          day.deliveries.forEach(delivery => {
            if (delivery.order_type && (delivery.order_type.includes('custom') || delivery.order_id === 3 || delivery.order_id === 2)) {
              customOrdersFound++;
              const date = new Date(day.calendar_date);
              console.log(`  📅 ${date.toLocaleDateString()}: Custom order (ID: ${delivery.order_id}, Type: ${delivery.order_type})`);
            }
          });
        }
      });
      
      if (customOrdersFound === 0) {
        console.log('  ❌ No custom orders found in any June calendar entries');
      } else {
        console.log(`  ✅ Found ${customOrdersFound} custom orders in June calendar`);
      }
      
    } else {
      console.log('❌ Calendar API returned error:', response.data.message);
    }
    
  } catch (error) {
    console.error('❌ Error testing calendar API:', error.message);
  }
}

testCalendarAPI();
