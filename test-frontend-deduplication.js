// Test the frontend deduplication logic for DeliveryPage.js
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

async function testFrontendDeduplication() {
  try {
    console.log('🧪 Testing frontend deduplication logic...');
    
    // Fetch the same data as DeliveryPage.js
    console.log('\n📡 Calling /delivery-enhanced/orders API...');
    const ordersResponse = await api.get('/delivery-enhanced/orders');
    
    if (ordersResponse.data.success) {
      const ordersData = ordersResponse.data.data;
      
      // Apply the same deduplication logic as in DeliveryPage.js
      console.log(`📦 Received ${ordersData.length} orders from API`);
      
      // Group orders by order_number and order_type to identify duplicates
      const orderMap = new Map();
      const duplicates = [];
      
      ordersData.forEach((order, index) => {
        const key = `${order.order_number}_${order.order_type}`;
        if (orderMap.has(key)) {
          duplicates.push({
            key,
            first: orderMap.get(key),
            duplicate: { ...order, originalIndex: index }
          });
          console.log(`🔄 Duplicate detected: ${order.order_number} (${order.order_type})`);
        } else {
          orderMap.set(key, { ...order, originalIndex: index });
        }
      });
      
      // Remove duplicates - keep the first occurrence of each order
      const deduplicatedOrders = Array.from(orderMap.values());
      
      if (duplicates.length > 0) {
        console.log(`⚠️ Found ${duplicates.length} duplicate order(s):`);
        duplicates.forEach(dup => {
          console.log(`   - ${dup.key} (removed duplicate)`);
        });
      } else {
        console.log('✅ No duplicates found');
      }
      
      console.log(`📊 Original count: ${ordersData.length} orders`);
      console.log(`✅ Final deduplicated count: ${deduplicatedOrders.length} orders`);
      
      // Check specifically for custom orders
      const customOrders = deduplicatedOrders.filter(o => o.order_type === 'custom_order');
      console.log(`\n🎨 Custom orders after deduplication: ${customOrders.length}`);
      
      // Check for the specific order that was duplicating
      const specificOrder = customOrders.filter(o => o.order_number === 'CUSTOM-MCNQQ7NW-GQEOI');
      console.log(`🔍 CUSTOM-MCNQQ7NW-GQEOI instances: ${specificOrder.length}`);
      
      if (specificOrder.length === 1) {
        console.log('✅ Deduplication successful - only one instance remains');
      } else if (specificOrder.length > 1) {
        console.log('❌ Deduplication failed - still have duplicates');
      } else {
        console.log('⚠️ Order not found in results');
      }
      
    } else {
      console.log('❌ API returned error:', ordersResponse.data.message);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testFrontendDeduplication();
