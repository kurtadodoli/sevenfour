// Debug specific custom order delivery status update
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

async function debugSpecificOrder() {
  try {
    console.log('🔍 Debugging CUSTOM-MCNQQ7NW-GQEOI delivery status update...\n');
    
    // Step 1: Get the current order data
    console.log('📦 Step 1: Fetching current order data...');
    const ordersResponse = await api.get('/delivery-enhanced/orders');
    
    if (!ordersResponse.data.success) {
      console.log('❌ Failed to fetch orders:', ordersResponse.data.message);
      return;
    }
    
    const orders = ordersResponse.data.data;
    const targetOrder = orders.find(o => o.order_number === 'CUSTOM-MCNQQ7NW-GQEOI');
    
    if (!targetOrder) {
      console.log('❌ Order CUSTOM-MCNQQ7NW-GQEOI not found in orders list');
      return;
    }
    
    console.log('✅ Found target order:');
    console.log(`   - ID: ${targetOrder.id}`);
    console.log(`   - Order Number: ${targetOrder.order_number}`);
    console.log(`   - Order Type: ${targetOrder.order_type}`);
    console.log(`   - Current Delivery Status: ${targetOrder.delivery_status}`);
    console.log(`   - Customer: ${targetOrder.customer_name}`);
    
    // Step 2: Try to update the delivery status
    console.log('\n📡 Step 2: Attempting delivery status update...');
    const updateResponse = await api.put(`/delivery-status/orders/${targetOrder.id}/status`, {
      delivery_status: 'delivered',
      order_type: targetOrder.order_type,
      delivery_notes: 'Status updated via debug script'
    });
    
    console.log('📥 Update API Response:', updateResponse.data);
    
    if (updateResponse.data.success) {
      console.log('✅ Status update API call successful');
      
      // Step 3: Verify the update by fetching orders again
      console.log('\n🔍 Step 3: Verifying status update...');
      const verifyResponse = await api.get('/delivery-enhanced/orders');
      
      if (verifyResponse.data.success) {
        const updatedOrders = verifyResponse.data.data;
        const updatedOrder = updatedOrders.find(o => o.order_number === 'CUSTOM-MCNQQ7NW-GQEOI');
        
        if (updatedOrder) {
          console.log('📊 Updated order status:');
          console.log(`   - Current Delivery Status: ${updatedOrder.delivery_status}`);
          
          if (updatedOrder.delivery_status === 'delivered') {
            console.log('✅ SUCCESS: Status update persisted correctly!');
          } else {
            console.log('❌ ISSUE: Status update did not persist');
            console.log('   This suggests the update is not saving to the database correctly');
            
            // Step 4: Check the database directly for this order
            console.log('\n🔍 Step 4: Checking database update details...');
            console.log('   API response data:', updateResponse.data.data);
          }
        } else {
          console.log('❌ Order not found in verification fetch');
        }
      }
      
    } else {
      console.log('❌ Status update failed:', updateResponse.data.message);
    }
    
    // Step 5: Try updating back to original status
    console.log('\n🔄 Step 5: Restoring original status...');
    await api.put(`/delivery-status/orders/${targetOrder.id}/status`, {
      delivery_status: 'scheduled',
      order_type: targetOrder.order_type,
      delivery_notes: 'Status restored after debug test'
    });
    console.log('✅ Status restored to scheduled');
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

debugSpecificOrder();
