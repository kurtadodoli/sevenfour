// Test Enhanced Delivery API
const testEnhancedDeliveryAPI = async () => {
  const baseURL = 'http://localhost:5000';
  
  try {
    console.log('🔍 Testing Enhanced Delivery API endpoints...');
    
    // Test 1: Get orders for delivery
    console.log('\n📦 Testing GET /delivery-enhanced/orders...');
    try {
      const ordersResponse = await fetch(`${baseURL}/delivery-enhanced/orders`, {
        headers: {
          'Authorization': 'Bearer fake-token-for-testing'
        }
      });
      const ordersData = await ordersResponse.json();
      console.log('Orders Response Status:', ordersResponse.status);
      console.log('Orders Response:', ordersData);
    } catch (error) {
      console.log('❌ Orders endpoint error:', error.message);
    }
    
    // Test 2: Get calendar data
    console.log('\n📅 Testing GET /delivery-enhanced/calendar...');
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    try {
      const calendarResponse = await fetch(`${baseURL}/delivery-enhanced/calendar?year=${currentYear}&month=${currentMonth}`, {
        headers: {
          'Authorization': 'Bearer fake-token-for-testing'
        }
      });
      const calendarData = await calendarResponse.json();
      console.log('Calendar Response Status:', calendarResponse.status);
      console.log('Calendar Response:', calendarData);
    } catch (error) {
      console.log('❌ Calendar endpoint error:', error.message);
    }
    
    // Test 3: Test schedule delivery (POST)
    console.log('\n🚚 Testing POST /delivery-enhanced/schedule...');
    const sampleScheduleData = {
      order_id: 1,
      order_type: 'regular',
      delivery_date: '2025-06-30',
      delivery_time_slot: '10:00-12:00',
      courier_id: 1,
      delivery_notes: 'Test delivery scheduling',
      priority_level: 'normal'
    };
    
    try {
      const scheduleResponse = await fetch(`${baseURL}/delivery-enhanced/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer fake-token-for-testing'
        },
        body: JSON.stringify(sampleScheduleData)
      });
      const scheduleResult = await scheduleResponse.json();
      console.log('Schedule Response Status:', scheduleResponse.status);
      console.log('Schedule Response:', scheduleResult);
    } catch (error) {
      console.log('❌ Schedule endpoint error:', error.message);
    }
    
    console.log('\n✅ Enhanced Delivery API test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run the test
testEnhancedDeliveryAPI();
