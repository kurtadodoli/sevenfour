// Final test to ensure delivery management operations work
const axios = require('axios');

async function testDeliveryOperations() {
  console.log('🧪 Testing Delivery Management Operations...\n');
  
  const baseURL = 'http://localhost:5000/api';
  
  try {
    // Test 1: Get orders that need scheduling
    console.log('1️⃣ Getting orders for delivery management...');
    const ordersResponse = await axios.get(`${baseURL}/delivery-enhanced/orders`);
    const orders = ordersResponse.data.data;
    
    const pendingOrders = orders.filter(order => !order.delivery_status || order.delivery_status === 'pending');
    const scheduledOrders = orders.filter(order => order.delivery_status === 'scheduled');
    const inTransitOrders = orders.filter(order => order.delivery_status === 'in_transit');
    const deliveredOrders = orders.filter(order => order.delivery_status === 'delivered');
    
    console.log(`📊 Order Status Breakdown:
    - Pending: ${pendingOrders.length} orders
    - Scheduled: ${scheduledOrders.length} orders  
    - In Transit: ${inTransitOrders.length} orders
    - Delivered: ${deliveredOrders.length} orders`);
    
    // Test 2: Calendar view for current month
    console.log('\n2️⃣ Testing calendar view...');
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    
    const calendarResponse = await axios.get(`${baseURL}/delivery-enhanced/calendar`, {
      params: { year, month }
    });
    
    const calendarData = calendarResponse.data.data;
    console.log(`📅 Calendar for ${year}-${month}:
    - Total days: ${calendarData.calendar.length}
    - Days with deliveries: ${calendarData.calendar.filter(day => day.deliveries.length > 0).length}
    - Total scheduled deliveries: ${calendarData.summary.totalDeliveries}`);
    
    // Show upcoming deliveries
    const upcomingDeliveries = [];
    calendarData.calendar.forEach(day => {
      day.deliveries.forEach(delivery => {
        upcomingDeliveries.push({
          date: day.calendar_date,
          time: delivery.delivery_time_slot,
          orderId: delivery.order_id,
          status: delivery.delivery_status
        });
      });
    });
    
    console.log(`📋 Upcoming deliveries: ${upcomingDeliveries.length}`);
    upcomingDeliveries.slice(0, 3).forEach((delivery, index) => {
      console.log(`  ${index + 1}. Order ${delivery.orderId} - ${delivery.date} ${delivery.time} (${delivery.status})`);
    });
    
    // Test 3: Verify courier availability
    console.log('\n3️⃣ Testing courier management...');
    const couriersResponse = await axios.get(`${baseURL}/couriers`);
    const couriers = couriersResponse.data;
    const activeCouriers = couriers.filter(courier => courier.status === 'active');
    
    console.log(`🚛 Couriers available: ${activeCouriers.length} active out of ${couriers.length} total`);
    
    // Test 4: Verify all components are integrated
    console.log('\n4️⃣ Integration verification...');
    
    // Check if orders have proper shipping information
    const ordersWithShipping = orders.filter(order => order.shipping_address && order.shipping_address.trim());
    console.log(`📦 Orders with shipping info: ${ordersWithShipping.length}/${orders.length}`);
    
    // Check if scheduled orders have proper delivery information
    const properlyScheduled = scheduledOrders.filter(order => 
      order.scheduled_delivery_date && order.scheduled_delivery_time
    );
    console.log(`📅 Properly scheduled orders: ${properlyScheduled.length}/${scheduledOrders.length}`);
    
    console.log('\n🎯 System Status:');
    if (pendingOrders.length > 0) {
      console.log(`⚠️  ${pendingOrders.length} orders need scheduling`);
    }
    if (inTransitOrders.length > 0) {
      console.log(`🚚 ${inTransitOrders.length} orders in transit`);
    }
    if (activeCouriers.length === 0) {
      console.log(`⚠️  No active couriers available`);
    } else {
      console.log(`✅ ${activeCouriers.length} couriers ready for deliveries`);
    }
    
    console.log('\n🚀 DeliveryPage.js should display:');
    console.log(`- ${orders.length} total orders in the system`);
    console.log(`- Calendar with ${calendarData.calendar.length} days and ${calendarData.summary.totalDeliveries} scheduled deliveries`);
    console.log(`- ${activeCouriers.length} active couriers for assignment`);
    console.log(`- ${pendingOrders.length} orders awaiting scheduling`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.status, error.response.data);
    }
  }
}

testDeliveryOperations();
