const axios = require('axios');

async function testCalendarAPI() {
  try {
    console.log('🧪 Testing calendar API for July 2025...\n');
    
    const response = await axios.get('http://localhost:5000/api/delivery-enhanced/calendar', {
      params: { year: 2025, month: 7 }
    });
    
    if (response.data.success) {
      const calendarData = response.data.data.calendar;
      
      // Find July 3rd entry
      const july3 = calendarData.find(day => {
        const date = new Date(day.calendar_date);
        return date.getDate() === 3 && date.getMonth() === 6; // July is month 6 (0-indexed)
      });
      
      if (july3) {
        console.log('📅 July 3, 2025 Calendar Data:');
        console.log(`   - Calendar Date: ${july3.calendar_date}`);
        console.log(`   - Scheduled Deliveries: ${july3.scheduled_deliveries}`);
        console.log(`   - Available: ${july3.is_available}`);
        console.log('');
        
        if (july3.scheduled_deliveries === 2) {
          console.log('✅ SUCCESS: Calendar API now shows correct count of 2!');
        } else {
          console.log(`❌ ISSUE: Calendar API still shows ${july3.scheduled_deliveries} instead of 2`);
        }
      } else {
        console.log('❌ July 3rd not found in calendar data');
      }
    } else {
      console.log('❌ API request failed:', response.data.message);
    }
    
  } catch (error) {
    console.log('❌ Error testing API:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure the server is running on port 5000');
    }
  }
}

testCalendarAPI();
