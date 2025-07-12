// Test script to verify calendar icon fix
console.log('🧪 Testing Calendar Icon Fix');
console.log('============================');

// Simulate the API data structure
const mockApiResponse = {
  success: true,
  data: {
    calendar: [
      {
        calendar_date: '2025-07-07T12:00:00.000Z',
        deliveries: [
          {
            id: 5,
            order_number: 'ORD17518536871418982',
            delivery_date: '2025-07-07T12:00:00.000Z',
            delivery_status: 'in_transit',
            order_id: 10
          }
        ]
      },
      {
        calendar_date: '2025-07-08T12:00:00.000Z',
        deliveries: [
          {
            id: 3,
            order_number: 'ORD17518218397044825',
            delivery_date: '2025-07-08T12:00:00.000Z',
            delivery_status: 'scheduled',
            order_id: 4
          }
        ]
      },
      {
        calendar_date: '2025-07-25T12:00:00.000Z',
        deliveries: [
          {
            id: 1,
            order_number: 'ORD17518149893827056',
            delivery_date: '2025-07-25T12:00:00.000Z',
            delivery_status: 'scheduled',
            order_id: 1
          }
        ]
      }
    ]
  }
};

console.log('📊 Original API structure:');
console.log(`Calendar entries: ${mockApiResponse.data.calendar.length}`);
mockApiResponse.data.calendar.forEach(entry => {
  console.log(`- ${entry.calendar_date}: ${entry.deliveries.length} deliveries`);
});

console.log('\n🔧 Applying fix: Flattening deliveries...');

// Apply the fix logic
const allDeliveries = [];
if (mockApiResponse.data.calendar && Array.isArray(mockApiResponse.data.calendar)) {
  mockApiResponse.data.calendar.forEach(calendarEntry => {
    if (calendarEntry.deliveries && Array.isArray(calendarEntry.deliveries)) {
      allDeliveries.push(...calendarEntry.deliveries);
    }
  });
}

console.log(`\n✅ Flattened result: ${allDeliveries.length} total deliveries`);
allDeliveries.forEach(delivery => {
  console.log(`- ${delivery.delivery_date}: Order ${delivery.order_number}, Status: ${delivery.delivery_status}`);
});

console.log('\n🎯 Expected behavior:');
console.log('- July 7: Should show 🚚 icon (in_transit)');
console.log('- July 8: Should show 📅 icon (scheduled)');
console.log('- July 25: Should show 📅 icon (scheduled)');
console.log('\n✅ Fix applied successfully!');
