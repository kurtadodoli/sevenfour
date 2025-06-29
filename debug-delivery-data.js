// Debug script to check delivery data structure
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 5000,
});

async function debugDeliveryData() {
  console.log('🔍 Debugging delivery data structure...\n');
  
  try {
    // Check enhanced delivery orders
    console.log('📊 Fetching /delivery-enhanced/orders...');
    const ordersResponse = await api.get('/delivery-enhanced/orders');
    console.log('Response status:', ordersResponse.status);
    console.log('Response data structure:', {
      success: ordersResponse.data.success,
      dataType: typeof ordersResponse.data.data,
      dataLength: Array.isArray(ordersResponse.data.data) ? ordersResponse.data.data.length : 'not array',
    });
    
    if (ordersResponse.data.success && ordersResponse.data.data) {
      const orders = ordersResponse.data.data;
      console.log(`\n📦 Found ${orders.length} total orders`);
      
      // Show structure of first few orders
      orders.slice(0, 3).forEach((order, index) => {
        console.log(`\nOrder ${index + 1}:`, {
          id: order.id,
          order_id: order.order_id,
          courier_id: order.courier_id,
          delivery_status: order.delivery_status,
          status: order.status,
          scheduled_date: order.scheduled_date,
          actual_delivery_date: order.actual_delivery_date,
          // Show all keys for debugging
          allKeys: Object.keys(order)
        });
      });
      
      // Count deliveries by status
      const statusCounts = {};
      const courierCounts = {};
      
      orders.forEach(order => {
        const status = order.delivery_status || order.status || 'unknown';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
        
        if (order.courier_id) {
          courierCounts[order.courier_id] = (courierCounts[order.courier_id] || 0) + 1;
        }
      });
      
      console.log('\n📊 Delivery status counts:', statusCounts);
      console.log('📊 Deliveries per courier:', courierCounts);
      
      // Check for active deliveries (scheduled, in_transit)
      const activeStatuses = ['scheduled', 'in_transit', 'pending', 'confirmed'];
      const activeOrders = orders.filter(order => {
        const status = order.delivery_status || order.status;
        return status && activeStatuses.includes(status.toLowerCase());
      });
      
      console.log(`\n🔥 Active deliveries (${activeStatuses.join(', ')}):`);
      activeOrders.forEach(order => {
        console.log(`  - Order ${order.order_id || order.id}: Courier ${order.courier_id}, Status: ${order.delivery_status || order.status}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error fetching delivery data:', error.message);
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', error.response.data);
    }
  }
  
  // Also check couriers
  try {
    console.log('\n👥 Fetching couriers...');
    const couriersResponse = await api.get('/couriers');
    console.log('Couriers response status:', couriersResponse.status);
    
    if (couriersResponse.data.success && couriersResponse.data.data) {
      const couriers = couriersResponse.data.data;
      console.log(`Found ${couriers.length} couriers:`);
      couriers.forEach(courier => {
        console.log(`  - ${courier.name} (ID: ${courier.id}, Status: ${courier.status})`);
      });
    }
  } catch (error) {
    console.error('❌ Error fetching couriers:', error.message);
  }
}

debugDeliveryData().then(() => {
  console.log('\n✅ Debug complete');
}).catch(error => {
  console.error('❌ Debug failed:', error);
});
