const axios = require('axios');

async function testCustomOrdersAPI() {
  const baseURL = 'http://localhost:3001'; // Based on the netstat output
  
  try {
    console.log('🔄 Testing custom orders API endpoints...');
    
    // Test 1: Get all custom orders (admin endpoint)
    console.log('\n1️⃣ Testing GET /api/custom-orders/admin/all');
    try {
      const response = await axios.get(`${baseURL}/api/custom-orders/admin/all`);
      console.log(`✅ Status: ${response.status}`);
      console.log(`📊 Data: ${JSON.stringify(response.data, null, 2)}`);
      
      if (response.data.success && response.data.data) {
        const approvedOrders = response.data.data.filter(order => order.status === 'approved');
        console.log(`🎨 Found ${approvedOrders.length} approved custom orders`);
        
        approvedOrders.forEach(order => {
          console.log(`  - ${order.custom_order_id}: ${order.product_name} (${order.status})`);
        });
      }
    } catch (error) {
      console.log(`❌ Error: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
    }
    
    // Test 2: Get confirmed orders
    console.log('\n2️⃣ Testing GET /api/orders/confirmed');
    try {
      const response = await axios.get(`${baseURL}/api/orders/confirmed`);
      console.log(`✅ Status: ${response.status}`);
      
      if (response.data.success && response.data.data) {
        console.log(`📦 Found ${response.data.data.length} confirmed regular orders`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
    }
    
    console.log('\n✅ API testing completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCustomOrdersAPI();
