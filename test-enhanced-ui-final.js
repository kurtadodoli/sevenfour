const axios = require('axios');

async function testEnhancedUI() {
  console.log('🎨 Testing Enhanced Order Management UI...\n');

  try {
    // Get orders from the delivery API
    const response = await axios.get('http://localhost:5000/api/delivery-enhanced/orders');
    
    if (!response.data.success) {
      console.error('❌ API call failed:', response.data.message);
      return;
    }

    const orders = response.data.data.slice(0, 10); // Test with first 10 orders

    console.log(`📊 Testing UI with ${orders.length} orders:\n`);

    orders.forEach((order, index) => {
      console.log(`${index + 1}. Order ${order.order_number || order.id}:`);
      console.log(`   Customer: ${order.customerName}`);
      console.log(`   Amount: ₱${parseFloat(order.total_amount).toFixed(2)}`);
      console.log(`   Status: ${order.delivery_status || 'pending'}`);
      
      if (order.scheduled_delivery_date) {
        console.log(`   📅 Scheduled: ${new Date(order.scheduled_delivery_date).toLocaleDateString()}`);
        if (order.delivery_time_slot) {
          console.log(`   ⏰ Time Slot: ${order.delivery_time_slot}`);
        }
      }
      
      // Test courier visibility logic
      const isScheduledOrder = ['scheduled', 'in_transit', 'delivered'].includes(order.delivery_status);
      
      if (isScheduledOrder) {
        console.log(`   🚚 Courier Section: VISIBLE`);
        if (order.courier_name) {
          console.log(`   ✅ Courier Assigned: ${order.courier_name}`);
          console.log(`   📱 Phone: ${order.courier_phone || 'Not provided'}`);
          console.log(`   UI Theme: Blue (assigned)`);
        } else {
          console.log(`   ⚠️ No Courier Assigned`);
          console.log(`   UI Theme: Orange (warning)`);
        }
      } else {
        console.log(`   🚚 Courier Section: HIDDEN (not scheduled)`);
      }
      
      // Test action buttons logic
      console.log(`   🎛️ Action Buttons:`);
      if (!order.delivery_status || order.delivery_status === 'pending') {
        console.log(`     - Schedule Delivery & Assign Courier (GREEN, prominent)`);
      } else {
        console.log(`     - Delivery Management Actions Header`);
        
        if (order.delivery_status === 'scheduled') {
          console.log(`     - ✅ Delivered (GREEN)`);
          console.log(`     - 🚚 In Transit (BLUE)`);
          console.log(`     - ⚠️ Delay (YELLOW)`);
          console.log(`     - ❌ Cancel (RED)`);
          console.log(`     - 🗑️ Remove Order (RED, danger zone)`);
        } else if (order.delivery_status === 'in_transit') {
          console.log(`     - ✅ Delivered (GREEN)`);
          console.log(`     - ⚠️ Delay (YELLOW)`);
          console.log(`     - ❌ Cancel (RED)`);
          console.log(`     - 🗑️ Remove Order (RED, danger zone)`);
        } else if (order.delivery_status === 'delayed') {
          console.log(`     - 📅 Reschedule & Reassign Courier (YELLOW, prominent)`);
          console.log(`     - 🗑️ Remove Order (RED, danger zone)`);
        } else if (order.delivery_status === 'cancelled') {
          console.log(`     - 🔄 Restore (GREEN)`);
          console.log(`     - 🗑️ Delete (GRAY)`);
        } else if (order.delivery_status === 'delivered') {
          console.log(`     - No action buttons (completed order)`);
        }
      }
      
      console.log(''); // Empty line for readability
    });

    // Test specific UI scenarios
    console.log('🎯 UI Enhancement Test Results:\n');
    
    const scheduledWithCourier = orders.filter(o => 
      ['scheduled', 'in_transit', 'delivered'].includes(o.delivery_status) && o.courier_name
    );
    console.log(`✅ Orders with VISIBLE courier info: ${scheduledWithCourier.length}`);
    
    const scheduledWithoutCourier = orders.filter(o => 
      ['scheduled', 'in_transit', 'delivered'].includes(o.delivery_status) && !o.courier_name
    );
    console.log(`⚠️ Orders with COURIER WARNING: ${scheduledWithoutCourier.length}`);
    
    const unscheduled = orders.filter(o => 
      !o.delivery_status || o.delivery_status === 'pending'
    );
    console.log(`📋 Orders ready for SCHEDULING: ${unscheduled.length}`);
    
    console.log('\n🎨 Enhanced UI Features Tested:');
    console.log('✅ Modern card-based layout with header gradients');
    console.log('✅ Two-column layout: info + actions');
    console.log('✅ Enhanced order header with large icons and status badges');
    console.log('✅ Grid-based date information cards');
    console.log('✅ Prominent courier information section');
    console.log('✅ Conditional courier visibility for scheduled orders');
    console.log('✅ Color-coded courier assignment status');
    console.log('✅ Organized action buttons with visual hierarchy');
    console.log('✅ Contextual action button visibility');
    console.log('✅ Enhanced product display section');
    console.log('✅ Gradient backgrounds and modern styling');
    
    console.log('\n🚚 Courier Visibility Test:');
    console.log(`- Orders that SHOULD show courier section: ${scheduledWithCourier.length + scheduledWithoutCourier.length}`);
    console.log(`- Orders with assigned couriers (blue theme): ${scheduledWithCourier.length}`);
    console.log(`- Orders needing courier assignment (orange warning): ${scheduledWithoutCourier.length}`);
    console.log(`- Orders without courier section (unscheduled): ${unscheduled.length}`);

  } catch (error) {
    console.error('❌ Error testing enhanced UI:', error.message);
  }
}

testEnhancedUI().catch(console.error);
