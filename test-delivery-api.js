const axios = require('axios');

async function testDeliveryAPI() {
  try {
    console.log('🧪 Testing DeliveryPage API endpoint...\n');
    
    // Test the delivery orders endpoint
    const response = await axios.get('http://localhost:5000/api/delivery-enhanced/orders');
    
    if (response.data && response.data.success && response.data.data) {
      const orders = response.data.data;
      const customOrders = orders.filter(order => order.order_type === 'custom_order');
      
      console.log(`📊 Total orders returned: ${orders.length}`);
      console.log(`📊 Custom orders: ${customOrders.length}\n`);
      
      console.log('🎨 CUSTOM ORDERS WITH COURIER INFO:');
      customOrders.forEach(order => {
        console.log(`   Order: ${order.order_number || order.id}`);
        console.log(`   Customer: ${order.customerName || order.customer_name}`);
        console.log(`   Delivery Status: ${order.delivery_status}`);
        console.log(`   Courier Name: ${order.courier_name || 'NULL'}`);
        console.log(`   Courier Phone: ${order.courier_phone || 'NULL'}`);
        console.log(`   Scheduled Date: ${order.scheduled_delivery_date || 'NULL'}`);
        console.log('');
      });
      
      // Check for the specific order we just fixed
      const specificOrder = customOrders.find(order => 
        order.order_number === 'CUSTOM-MCNOZFFQ-X8B36' || 
        order.id === 'CUSTOM-MCNOZFFQ-X8B36'
      );
      
      if (specificOrder) {
        console.log('✅ FOUND SPECIFIC ORDER FROM SCREENSHOT:');
        console.log(`   Order: ${specificOrder.order_number || specificOrder.id}`);
        console.log(`   Customer: ${specificOrder.customerName || specificOrder.customer_name}`);
        console.log(`   Courier Name: ${specificOrder.courier_name || 'NULL'}`);
        console.log(`   Courier Phone: ${specificOrder.courier_phone || 'NULL'}`);
        
        if (specificOrder.courier_name && specificOrder.courier_phone) {
          console.log('   🎉 SUCCESS: Courier information is now properly returned!');
        } else {
          console.log('   ❌ ISSUE: Courier information is still missing');
        }
      } else {
        console.log('❌ Specific order not found in API response');
      }
      
    } else {
      console.log('❌ API response format unexpected:', response.data);
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testDeliveryAPI();
