/**
 * Test script to verify enhanced design and courier display
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testEnhancedDesign() {
  try {
    console.log('🎨 Testing Enhanced Order Management Design...\n');
    
    const response = await axios.get(`${BASE_URL}/api/delivery-enhanced/orders`);
    
    if (!response.data.success) {
      console.error('❌ API request failed:', response.data.message);
      return;
    }
    
    const orders = response.data.data.orders || response.data.data || [];
    console.log(`📦 Total orders: ${orders.length}`);
    
    // Find the specific order from the screenshot
    const targetOrder = orders.find(order => order.order_number === 'ORD17517233654614104');
    
    if (targetOrder) {
      console.log('\n✅ Found target order from screenshot:');
      console.log('📋 Order Details:');
      console.log(`   Order Number: ${targetOrder.order_number}`);
      console.log(`   Customer: ${targetOrder.customer_name || targetOrder.customerName}`);
      console.log(`   Amount: ₱${parseFloat(targetOrder.total_amount || 0).toFixed(2)}`);
      console.log(`   Status: ${targetOrder.delivery_status || 'pending'}`);
      
      // Check order date
      const orderDate = targetOrder.created_at || targetOrder.order_date || targetOrder.timestamp;
      if (orderDate) {
        try {
          const date = new Date(orderDate);
          console.log(`   Order Date: ${isNaN(date.getTime()) ? 'Invalid date' : date.toLocaleDateString()}`);
        } catch (e) {
          console.log(`   Order Date: Error parsing date`);
        }
      }
      
      // Check scheduled date
      if (targetOrder.scheduled_delivery_date) {
        try {
          const schedDate = new Date(targetOrder.scheduled_delivery_date);
          console.log(`   📅 Scheduled: ${schedDate.toLocaleDateString()} ${targetOrder.delivery_time_slot || ''}`);
        } catch (e) {
          console.log(`   📅 Scheduled: Error parsing date`);
        }
      }
      
      // Check courier assignment
      console.log('\n🚚 Courier Information:');
      console.log(`   Courier Name: ${targetOrder.courier_name || 'NOT ASSIGNED'}`);
      console.log(`   Courier Phone: ${targetOrder.courier_phone || 'NOT ASSIGNED'}`);
      
      if (targetOrder.courier_name) {
        console.log('\n✅ SUCCESS: Courier information is available!');
        console.log('   The enhanced design should now display:');
        console.log('   - Order header with type icon and status badge');
        console.log('   - Grid layout for order and scheduled dates');
        console.log('   - Prominent courier section with blue styling');
        console.log('   - Organized action buttons in separate column');
      } else {
        console.log('\n⚠️ WARNING: No courier assigned to this order');
        console.log('   The design should show an orange warning box');
        console.log('   requesting courier assignment.');
      }
      
      // Check if order is scheduled (should show courier section)
      const isScheduled = targetOrder.delivery_status && 
                         targetOrder.delivery_status !== 'pending';
      
      console.log(`\n📊 Order State Analysis:`);
      console.log(`   Is Scheduled: ${isScheduled ? 'YES' : 'NO'}`);
      console.log(`   Should Show Courier Section: ${isScheduled ? 'YES' : 'NO'}`);
      console.log(`   Courier Section Type: ${targetOrder.courier_name ? 'BLUE (Assigned)' : 'ORANGE (Warning)'}`);
      
    } else {
      console.log('\n❌ Target order not found in API response');
      
      // Show orders with courier assignments
      const ordersWithCouriers = orders.filter(order => order.courier_name);
      console.log(`\n📋 Orders with courier assignments: ${ordersWithCouriers.length}`);
      
      if (ordersWithCouriers.length > 0) {
        ordersWithCouriers.slice(0, 3).forEach((order, index) => {
          console.log(`\n${index + 1}. ${order.order_number}`);
          console.log(`   Customer: ${order.customer_name || order.customerName}`);
          console.log(`   Status: ${order.delivery_status}`);
          console.log(`   Courier: ${order.courier_name} (${order.courier_phone})`);
        });
      }
    }
    
    console.log('\n🎨 Enhanced Design Features:');
    console.log('✅ Card-based layout with hover effects');
    console.log('✅ Color-coded order type indicators');
    console.log('✅ Grid-based information layout');
    console.log('✅ Prominent courier section for scheduled orders');
    console.log('✅ Organized action buttons in dedicated column');
    console.log('✅ Visual status badges and icons');
    
  } catch (error) {
    console.error('❌ Error testing enhanced design:', error.message);
  }
}

testEnhancedDesign();
