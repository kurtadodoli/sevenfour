// Test script to check delivery status persistence
const api = require('./server/api'); // Adjust path as needed

async function testDeliveryStatusPersistence() {
  console.log('🔍 Testing delivery status persistence...');
  
  try {
    // Fetch delivery schedules
    console.log('📅 Fetching delivery schedules...');
    const schedules = await fetch('http://localhost:5000/api/delivery/schedules');
    const schedulesData = await schedules.json();
    
    console.log('📊 Delivery schedules response:', schedulesData);
    
    if (Array.isArray(schedulesData)) {
      schedulesData.forEach(schedule => {
        console.log(`📋 Schedule ${schedule.id}:`);
        console.log(`   - delivery_status: "${schedule.delivery_status}"`);
        console.log(`   - status: "${schedule.status}"`);
        console.log(`   - order_id: ${schedule.order_id}`);
      });
    }
    
    // Fetch orders
    console.log('\n📦 Fetching orders...');
    const orders = await fetch('http://localhost:5000/api/orders/confirmed');
    const ordersData = await orders.json();
    
    console.log('📊 Orders response:', ordersData);
    
    if (ordersData.success && ordersData.data) {
      ordersData.data.forEach(order => {
        console.log(`📋 Order ${order.order_number}:`);
        console.log(`   - delivery_status: "${order.delivery_status}"`);
        console.log(`   - status: "${order.status}"`);
        console.log(`   - id: ${order.id}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error testing delivery status:', error);
  }
}

testDeliveryStatusPersistence();
