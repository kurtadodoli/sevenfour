/**
 * Script to find orders with courier assignments and test specific ones
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function findOrdersWithCouriers() {
  try {
    console.log('🔍 Finding orders with courier assignments...\n');
    
    const response = await axios.get(`${BASE_URL}/api/delivery-enhanced/orders`);
    
    if (!response.data.success) {
      console.error('❌ API request failed:', response.data.message);
      return;
    }
    
    const orders = response.data.data.orders || response.data.data || [];
    console.log(`📦 Total orders: ${orders.length}`);
    
    // Find orders with courier information
    const ordersWithCouriers = orders.filter(order => 
      order.courier_name || order.courier_phone
    );
    
    console.log(`🚚 Orders with courier assignments: ${ordersWithCouriers.length}\n`);
    
    if (ordersWithCouriers.length > 0) {
      console.log('📋 Orders with assigned couriers:');
      ordersWithCouriers.forEach((order, index) => {
        console.log(`${index + 1}. Order: ${order.order_number}`);
        console.log(`   Customer: ${order.customer_name || order.customerName || 'N/A'}`);
        console.log(`   Status: ${order.delivery_status || 'pending'}`);
        console.log(`   Courier: ${order.courier_name || 'N/A'}`);
        console.log(`   Phone: ${order.courier_phone || 'N/A'}`);
        
        if (order.scheduled_delivery_date) {
          const schedDate = new Date(order.scheduled_delivery_date);
          console.log(`   Scheduled: ${schedDate.toLocaleDateString()}`);
        }
        console.log('');
      });
    } else {
      console.log('⚠️ No orders found with courier assignments.');
      
      // Let's look for orders that should have couriers (scheduled/in_transit)
      const scheduledOrders = orders.filter(order => 
        order.delivery_status === 'scheduled' || order.delivery_status === 'in_transit'
      );
      
      console.log(`\n📅 Scheduled/In-Transit orders without couriers: ${scheduledOrders.length}`);
      if (scheduledOrders.length > 0) {
        scheduledOrders.slice(0, 3).forEach((order, index) => {
          console.log(`${index + 1}. ${order.order_number} - ${order.delivery_status}`);
          console.log(`   Courier Name: ${order.courier_name || 'NOT SET'}`);
          console.log(`   Courier Phone: ${order.courier_phone || 'NOT SET'}`);
        });
      }
    }
    
    // Test the specific orders that were assigned couriers
    const testOrderNumbers = ['ORD17508699018537684', 'ORD17517233654614104'];
    
    console.log('\n🧪 Testing specific orders that should have couriers:');
    testOrderNumbers.forEach(orderNumber => {
      const order = orders.find(o => o.order_number === orderNumber);
      if (order) {
        console.log(`✅ Found ${orderNumber}:`);
        console.log(`   Courier Name: ${order.courier_name || 'NOT SET'}`);
        console.log(`   Courier Phone: ${order.courier_phone || 'NOT SET'}`);
        console.log(`   Status: ${order.delivery_status}`);
      } else {
        console.log(`❌ Order ${orderNumber} not found in API response`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

findOrdersWithCouriers();
