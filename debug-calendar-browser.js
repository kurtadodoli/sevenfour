// Browser Console Debug Script for Calendar Icons
// Copy and paste this into the browser console on the delivery page

console.log('🔍 MANUAL CALENDAR DEBUG');
console.log('========================');

// Check the API directly from browser
fetch('http://localhost:5000/api/delivery-enhanced/calendar?year=2025&month=7')
  .then(response => response.json())
  .then(data => {
    console.log('✅ API Response:', data);
    
    // Flatten like the component should
    const allDeliveries = [];
    if (data.data.calendar && Array.isArray(data.data.calendar)) {
      data.data.calendar.forEach(calendarEntry => {
        if (calendarEntry.deliveries && Array.isArray(calendarEntry.deliveries)) {
          allDeliveries.push(...calendarEntry.deliveries);
        }
      });
    }
    
    console.log(`📊 Flattened deliveries: ${allDeliveries.length}`);
    console.log('📅 Deliveries by date:');
    
    allDeliveries.forEach(delivery => {
      const date = new Date(delivery.delivery_date);
      console.log(`  • ${date.toLocaleDateString()}: Order ${delivery.order_number}, Status: ${delivery.delivery_status}`);
    });
    
    // Check July 7th specifically  
    const july7 = allDeliveries.filter(delivery => {
      const date = new Date(delivery.delivery_date);
      return date.getDate() === 7 && date.getMonth() === 6; // July is month 6
    });
    
    console.log(`🎯 July 7th deliveries: ${july7.length}`);
    july7.forEach(delivery => {
      console.log(`  • Order ${delivery.order_number}, Status: ${delivery.delivery_status}`);
    });
    
    if (july7.length > 0) {
      console.log('✅ July 7th should show an icon!');
    } else {
      console.log('❌ No July 7th deliveries found');
    }
  })
  .catch(error => {
    console.error('❌ API Error:', error);
  });

console.log('\n🔧 TROUBLESHOOTING STEPS:');
console.log('1. Press F12 to open DevTools');  
console.log('2. Go to Console tab');
console.log('3. Look for any error messages in red');
console.log('4. Check Network tab for failed API requests');
console.log('5. Try hard refresh (Ctrl+F5 or Cmd+Shift+R)');
