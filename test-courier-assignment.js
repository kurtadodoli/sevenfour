const axios = require('axios');

async function testCourierAssignment() {
  try {
    console.log('🧪 Testing courier assignment workflow...\n');
    
    // 1. Get a custom order without courier assignment
    console.log('1. GETTING CUSTOM ORDERS WITHOUT COURIER:');
    const ordersResponse = await axios.get('http://localhost:5000/api/delivery-enhanced/orders');
    
    if (!ordersResponse.data.success) {
      console.log('❌ Failed to get orders');
      return;
    }
    
    const orders = ordersResponse.data.data;
    const customOrdersWithoutCourier = orders.filter(order => 
      order.order_type === 'custom_order' && 
      !order.courier_name && 
      order.delivery_status === 'pending'
    );
    
    if (customOrdersWithoutCourier.length === 0) {
      console.log('   No custom orders without courier found');
      return;
    }
    
    const testOrder = customOrdersWithoutCourier[0];
    console.log(`   Selected order: ${testOrder.order_number || testOrder.id}`);
    console.log(`   Customer: ${testOrder.customerName || testOrder.customer_name}`);
    console.log(`   Current courier: ${testOrder.courier_name || 'NONE'}`);
    console.log('');
    
    // 2. Get available couriers
    console.log('2. GETTING AVAILABLE COURIERS:');
    const couriersResponse = await axios.get('http://localhost:5000/api/couriers');
    
    let couriers = [];
    if (Array.isArray(couriersResponse.data)) {
      couriers = couriersResponse.data;
    } else if (couriersResponse.data.success && Array.isArray(couriersResponse.data.couriers)) {
      couriers = couriersResponse.data.couriers;
    }
    
    const activeCouriers = couriers.filter(c => c.status === 'active');
    
    if (activeCouriers.length === 0) {
      console.log('   No active couriers found');
      return;
    }
    
    const testCourier = activeCouriers[0];
    console.log(`   Selected courier: ${testCourier.name} (${testCourier.phone_number})`);
    console.log(`   Courier ID: ${testCourier.id}`);
    console.log('');
    
    // 3. Schedule delivery with courier assignment
    console.log('3. SCHEDULING DELIVERY WITH COURIER ASSIGNMENT:');
    
    const scheduleData = {
      order_id: testOrder.id,
      order_number: testOrder.order_number || testOrder.id,
      order_type: testOrder.order_type,
      customer_name: testOrder.customerName || testOrder.customer_name,
      customer_email: testOrder.customer_email,
      customer_phone: testOrder.customer_phone,
      delivery_date: '2025-08-15',
      delivery_time_slot: '14:00',
      delivery_address: testOrder.shipping_address,
      delivery_city: testOrder.shipping_city,
      delivery_province: testOrder.shipping_province,
      delivery_postal_code: testOrder.shipping_postal_code,
      delivery_contact_phone: testOrder.shipping_phone,
      delivery_notes: `Test courier assignment for order ${testOrder.order_number || testOrder.id}`,
      priority_level: 'normal',
      courier_id: testCourier.id
    };
    
    console.log('   Sending schedule request with courier_id:', testCourier.id);
    
    const scheduleResponse = await axios.post('http://localhost:5000/api/delivery-enhanced/schedule', scheduleData);
    
    if (scheduleResponse.data.success) {
      console.log('   ✅ Delivery scheduled successfully');
      console.log(`   Schedule ID: ${scheduleResponse.data.data.delivery_schedule_id}`);
    } else {
      console.log('   ❌ Failed to schedule delivery:', scheduleResponse.data.message);
      return;
    }
    
    // 4. Verify courier assignment in database
    console.log('');
    console.log('4. VERIFYING COURIER ASSIGNMENT:');
    
    const verifyResponse = await axios.get('http://localhost:5000/api/delivery-enhanced/orders');
    
    if (verifyResponse.data.success) {
      const updatedOrders = verifyResponse.data.data;
      const updatedOrder = updatedOrders.find(o => o.id === testOrder.id);
      
      if (updatedOrder) {
        console.log(`   Order: ${updatedOrder.order_number || updatedOrder.id}`);
        console.log(`   Delivery Status: ${updatedOrder.delivery_status}`);
        console.log(`   Courier Name: ${updatedOrder.courier_name || 'NONE'}`);
        console.log(`   Courier Phone: ${updatedOrder.courier_phone || 'NONE'}`);
        console.log(`   Scheduled Date: ${updatedOrder.scheduled_delivery_date || 'NONE'}`);
        
        if (updatedOrder.courier_name && updatedOrder.courier_phone) {
          console.log('\n   🎉 SUCCESS: Courier assignment working correctly!');
        } else {
          console.log('\n   ❌ ISSUE: Courier information not properly saved/retrieved');
        }
      } else {
        console.log('   ❌ Order not found in updated list');
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing courier assignment:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testCourierAssignment();
