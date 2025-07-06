// Test delivery status update for custom orders
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

async function testDeliveryStatusUpdate() {
  try {
    console.log('🧪 Testing delivery status update for custom orders...');
    
    // First, try to get a token by logging in as admin
    console.log('\n🔐 Attempting admin login...');
    try {
      const loginResponse = await api.post('/auth/login', {
        email: 'admin@seven4clothing.com',
        password: 'admin123'
      });
      
      if (loginResponse.data.success && loginResponse.data.token) {
        const token = loginResponse.data.token;
        console.log('✅ Login successful, token obtained');
        
        // Set the token for future requests
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Now try to update the delivery status
        console.log('\n📦 Attempting to update delivery status for custom order...');
        const updateResponse = await api.put('/delivery-status/orders/44/status', {
          delivery_status: 'delivered',
          order_type: 'custom_order',
          delivery_notes: 'Status updated via test script'
        });
        
        console.log('✅ Status update response:', updateResponse.data);
        
      } else {
        console.log('❌ Login failed:', loginResponse.data.message);
      }
      
    } catch (loginError) {
      console.log('❌ Login error:', loginError.response?.data || loginError.message);
      
      // Try the status update without authentication to see if that's the issue
      console.log('\n🔓 Attempting status update without authentication...');
      try {
        const updateResponse = await api.put('/delivery-status/orders/44/status', {
          delivery_status: 'delivered',
          order_type: 'custom_order',
          delivery_notes: 'Status updated via test script (no auth)'
        });
        
        console.log('✅ Status update without auth response:', updateResponse.data);
        
      } catch (updateError) {
        console.log('❌ Status update without auth error:', updateError.response?.data || updateError.message);
        console.log('Status code:', updateError.response?.status);
      }
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testDeliveryStatusUpdate();
