const axios = require('axios');

async function debugTimezoneIssue() {
  console.log('🕐 DEBUGGING TIMEZONE ISSUE');
  console.log('===========================');
  
  try {
    const response = await axios.get('http://localhost:5000/api/delivery-enhanced/calendar', {
      params: { year: 2025, month: 7 }
    });
    
    const allDeliveries = [];
    response.data.data.calendar.forEach(calendarEntry => {
      if (calendarEntry.deliveries && Array.isArray(calendarEntry.deliveries)) {
        allDeliveries.push(...calendarEntry.deliveries);
      }
    });
    
    console.log('📅 Checking timezone handling for all deliveries:');
    allDeliveries.forEach(delivery => {
      const deliveryDate = new Date(delivery.delivery_date);
      
      console.log(`\n📦 Order ${delivery.order_number}:`);
      console.log(`  • Raw delivery_date: ${delivery.delivery_date}`);
      console.log(`  • Parsed Date object: ${deliveryDate}`);
      console.log(`  • Year: ${deliveryDate.getFullYear()}`);
      console.log(`  • Month: ${deliveryDate.getMonth()} (${deliveryDate.getMonth() + 1})`);
      console.log(`  • Date: ${deliveryDate.getDate()}`);
      console.log(`  • Local string: ${deliveryDate.toLocaleDateString()}`);
      console.log(`  • UTC string: ${deliveryDate.toUTCString()}`);
      console.log(`  • ISO string: ${deliveryDate.toISOString()}`);
    });
    
    // Test July 7th specifically
    console.log('\n🎯 Testing July 7th date matching:');
    const july7Test = new Date('2025-07-07');
    const today = new Date();
    
    console.log(`Today's date: ${today.toLocaleDateString()}`);
    console.log(`July 7th test date: ${july7Test.toLocaleDateString()}`);
    
    allDeliveries.forEach(delivery => {
      const deliveryDate = new Date(delivery.delivery_date);
      const matches = deliveryDate.getFullYear() === july7Test.getFullYear() &&
                      deliveryDate.getMonth() === july7Test.getMonth() &&
                      deliveryDate.getDate() === july7Test.getDate();
      
      console.log(`\n📋 ${delivery.order_number}:`);
      console.log(`  • Delivery: ${deliveryDate.getFullYear()}-${deliveryDate.getMonth()+1}-${deliveryDate.getDate()}`);
      console.log(`  • Target:   ${july7Test.getFullYear()}-${july7Test.getMonth()+1}-${july7Test.getDate()}`);
      console.log(`  • Matches July 7th: ${matches ? '✅ YES' : '❌ NO'}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugTimezoneIssue();
