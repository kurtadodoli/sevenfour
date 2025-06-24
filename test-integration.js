const axios = require('axios');

async function testCustomOrderApproval() {
  try {
    console.log('🧪 Testing Custom Order Approval → Delivery Integration');
    
    // Login as admin
    console.log('🔐 Logging in as admin...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'kurtadodoli@gmail.com',
      password: 'admin123'
    });
    
    if (!loginResponse.data.success) {
      console.log('❌ Login failed:', loginResponse.data.message);
      return;
    }
    
    const token = loginResponse.data.data.token;
    console.log('✅ Admin login successful');
    
    // Get current custom orders
    console.log('📋 Fetching custom orders...');
    const ordersResponse = await axios.get('http://localhost:3001/api/custom-orders/admin/all', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!ordersResponse.data.success || ordersResponse.data.data.length === 0) {
      console.log('❌ No custom orders found to test with');
      return;
    }
    
    // Find a pending order
    const pendingOrder = ordersResponse.data.data.find(order => order.status === 'pending');
    if (!pendingOrder) {
      console.log('❌ No pending custom orders found to approve');
      console.log('Available orders:', ordersResponse.data.data.map(o => `${o.custom_order_id}: ${o.status}`));
      return;
    }
    
    console.log(`📦 Found pending order: ${pendingOrder.custom_order_id}`);
    console.log(`👤 Customer: ${pendingOrder.customer_name}`);
    console.log(`🛍️ Product: ${pendingOrder.product_type} (${pendingOrder.size}, ${pendingOrder.color})`);
    
    // Check delivery orders before approval
    console.log('📋 Checking delivery orders before approval...');
    const beforeDeliveryResponse = await axios.get('http://localhost:3001/api/orders/confirmed', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const beforeCount = beforeDeliveryResponse.data.success ? beforeDeliveryResponse.data.data.length : 0;
    console.log(`📊 Delivery orders before: ${beforeCount}`);
    
    // Approve the order
    console.log('✅ Approving custom order...');
    const approvalResponse = await axios.put(
      `http://localhost:3001/api/custom-orders/${pendingOrder.custom_order_id}/status`,
      {
        status: 'approved',
        admin_notes: 'Test approval - automated integration test'
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    if (approvalResponse.data.success) {
      console.log('✅ Custom order approved successfully!');
      console.log('📝 Message:', approvalResponse.data.message);
      
      // Check delivery orders after approval
      console.log('📋 Checking delivery orders after approval...');
      const afterDeliveryResponse = await axios.get('http://localhost:3001/api/orders/confirmed', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (afterDeliveryResponse.data.success) {
        const afterCount = afterDeliveryResponse.data.data.length;
        console.log(`📊 Delivery orders after: ${afterCount}`);
        
        if (afterCount > beforeCount) {
          console.log('🎉 SUCCESS! New delivery order created!');
          
          // Find the new delivery order
          const newOrder = afterDeliveryResponse.data.data.find(order => 
            order.notes && order.notes.includes(pendingOrder.custom_order_id)
          );
          
          if (newOrder) {
            console.log('📦 New delivery order details:');
            console.log(`   Order Number: ${newOrder.order_number}`);
            console.log(`   Customer: ${newOrder.first_name} ${newOrder.last_name}`);
            console.log(`   Status: ${newOrder.status}`);
            console.log(`   Total: $${newOrder.total_amount}`);
            console.log(`   Address: ${newOrder.shipping_address}`);
            console.log(`   Notes: ${newOrder.notes}`);
          }
        } else {
          console.log('❌ FAILED: No new delivery order was created');
        }
      } else {
        console.log('⚠️ Could not fetch delivery orders after approval');
      }
    } else {
      console.log('❌ Failed to approve custom order:', approvalResponse.data.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.response?.data?.message || error.message);
  }
}

testCustomOrderApproval();
