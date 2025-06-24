const axios = require('axios');

async function testStatusUpdate() {
  try {
    // First, get a custom order ID to test with
    console.log('🔍 Getting custom orders...');
      const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'kurtadodoli@gmail.com',
      password: 'password123'  // Try common password
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Logged in as admin');
    
    const ordersResponse = await axios.get('http://localhost:3001/api/custom-orders/admin/all', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const orders = ordersResponse.data.data;
    if (orders.length === 0) {
      console.log('❌ No orders found to test with');
      return;
    }
    
    const testOrder = orders[0];
    console.log(`🧪 Testing status update for order: ${testOrder.custom_order_id}`);
    console.log(`Current status: ${testOrder.status}`);
    
    // Try to update status to 'rejected'
    console.log('🔄 Attempting to reject order...');
    const updateResponse = await axios.put(
      `http://localhost:3001/api/custom-orders/${testOrder.custom_order_id}/status`,
      {
        status: 'rejected',
        admin_notes: 'Test rejection from script'
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    console.log('✅ Status update successful:', updateResponse.data);
    
  } catch (error) {
    console.error('❌ Error testing status update:', error.response?.data || error.message);
  }
}

testStatusUpdate();
