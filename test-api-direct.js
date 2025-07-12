const axios = require('axios');

async function testCalendarAPI() {
  try {
    console.log('🧪 Testing Calendar API directly...');
    
    const response = await axios.get('http://localhost:5000/api/delivery-enhanced/calendar', {
      params: { year: 2025, month: 7 }
    });
    
    console.log('✅ API Response received');
    console.log('Success:', response.data.success);
    console.log('Calendar entries:', response.data.data.calendar.length);
    
    console.log('\n📅 Calendar entries by date:');
    response.data.data.calendar.forEach(entry => {
      console.log(`- ${entry.calendar_date}: ${entry.deliveries.length} delivery(ies), Scheduled: ${entry.scheduled_deliveries}`);
      
      if (entry.deliveries.length > 0) {
        entry.deliveries.forEach(delivery => {
          console.log(`  • Order ${delivery.order_number}, Status: ${delivery.delivery_status}`);
        });
      }
    });
    
    console.log('\n🔍 Looking for July 7th specifically...');
    const july7 = response.data.data.calendar.find(entry => entry.calendar_date.includes('2025-07-07'));
    if (july7) {
      console.log('✅ July 7 found in API response!');
      console.log('Deliveries:', july7.deliveries.length);
      july7.deliveries.forEach(delivery => {
        console.log(`  • Order ${delivery.order_number}, Status: ${delivery.delivery_status}`);
      });
    } else {
      console.log('❌ July 7 NOT found in API response');
    }
    
  } catch (error) {
    console.error('❌ API Error:', error.message);
  }
}

testCalendarAPI();
