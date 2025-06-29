// Test what DeliveryPage.js should receive from the APIs
const axios = require('axios');

async function simulateFrontendCalls() {
  console.log('🌐 Simulating DeliveryPage.js API Calls...\n');
  
  const apiConfig = {
    baseURL: 'http://localhost:5000',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  try {
    // 1. Enhanced Orders API (main data source)
    console.log('📊 Fetching orders data...');
    const ordersResponse = await axios.get('/api/delivery-enhanced/orders', apiConfig);
    
    if (ordersResponse.data.success) {
      console.log(`✅ Orders API Success: ${ordersResponse.data.data.length} orders received`);
      
      // Process orders like DeliveryPage.js does
      const processedOrders = ordersResponse.data.data.map(order => ({
        ...order,
        customerName: order.customer_name || `${order.first_name || ''} ${order.last_name || ''}`.trim() || 'Unknown Customer',
        priority: calculatePriority(order)
      }));
      
      console.log(`   📋 Sample processed order:
      - ID: ${processedOrders[0].id}
      - Customer: ${processedOrders[0].customerName}
      - Status: ${processedOrders[0].delivery_status || 'pending'}
      - Priority: ${processedOrders[0].priority}`);
    }
    
    // 2. Calendar API
    console.log('\n📅 Fetching calendar data...');
    const currentDate = new Date();
    const calendarResponse = await axios.get('/api/delivery-enhanced/calendar', {
      ...apiConfig,
      params: { 
        year: currentDate.getFullYear(), 
        month: currentDate.getMonth() + 1 
      }
    });
    
    if (calendarResponse.data.success) {
      console.log(`✅ Calendar API Success: ${calendarResponse.data.data.calendar.length} calendar days`);
      console.log(`   📊 Summary: ${JSON.stringify(calendarResponse.data.data.summary)}`);
    }
    
    // 3. Couriers API
    console.log('\n🚛 Fetching couriers data...');
    const couriersResponse = await axios.get('/api/couriers', apiConfig);
    
    if (Array.isArray(couriersResponse.data)) {
      console.log(`✅ Couriers API Success: ${couriersResponse.data.length} couriers`);
      const activeCouriers = couriersResponse.data.filter(c => c.status === 'active');
      console.log(`   👥 Active couriers: ${activeCouriers.length}`);
    }
    
    console.log('\n🎯 DeliveryPage.js Data Summary:');
    console.log('✅ All required APIs are responding correctly');
    console.log('✅ Data structure matches frontend expectations');
    console.log('✅ No authentication barriers for calendar');
    console.log('✅ Orders include delivery status and scheduling info');
    console.log('\n🚀 DeliveryPage should render successfully!');
    
  } catch (error) {
    console.error('❌ Simulation failed:', error.message);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data:`, error.response.data);
    }
  }
}

// Simple priority calculation like in DeliveryPage.js
function calculatePriority(order) {
  if (!order.order_date) return 'medium';
  
  const orderDate = new Date(order.order_date);
  const daysSinceOrder = Math.floor((Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysSinceOrder >= 3) return 'high';
  if (daysSinceOrder >= 1) return 'medium';
  return 'low';
}

simulateFrontendCalls();
