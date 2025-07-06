// Test script to debug duplicate custom orders in DeliveryPage.js
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

async function debugDuplicateCustomOrders() {
  try {
    console.log('🔍 Testing DeliveryPage.js duplicate custom orders issue...');
    
    // Call the same API that DeliveryPage.js uses
    console.log('\n📡 Calling /delivery-enhanced/orders API...');
    const response = await api.get('/delivery-enhanced/orders');
    
    if (response.data.success) {
      const orders = response.data.data;
      console.log(`\n📊 Total orders returned: ${orders.length}`);
      
      // Group by order type
      const ordersByType = {};
      orders.forEach(order => {
        const type = order.order_type || 'unknown';
        if (!ordersByType[type]) {
          ordersByType[type] = [];
        }
        ordersByType[type].push(order);
      });
      
      console.log('\n📈 Orders by type:');
      Object.keys(ordersByType).forEach(type => {
        console.log(`  ${type}: ${ordersByType[type].length} orders`);
      });
      
      // Check for duplicates in custom orders
      const customOrders = ordersByType['custom_order'] || [];
      console.log(`\n🎨 Analyzing ${customOrders.length} custom orders for duplicates...`);
      
      const orderNumberMap = {};
      const duplicates = [];
      
      customOrders.forEach(order => {
        const orderNumber = order.order_number;
        if (orderNumberMap[orderNumber]) {
          duplicates.push({
            orderNumber,
            first: orderNumberMap[orderNumber],
            duplicate: order
          });
        } else {
          orderNumberMap[orderNumber] = order;
        }
      });
      
      if (duplicates.length > 0) {
        console.log(`\n❌ Found ${duplicates.length} duplicate custom orders:`);
        duplicates.forEach(dup => {
          console.log(`\n🔄 Duplicate: ${dup.orderNumber}`);
          console.log(`  First instance - ID: ${dup.first.id}, Source: ${dup.first.table_source || 'unknown'}`);
          console.log(`  Duplicate instance - ID: ${dup.duplicate.id}, Source: ${dup.duplicate.table_source || 'unknown'}`);
        });
      } else {
        console.log('\n✅ No duplicate custom orders found');
      }
      
      // Show sample custom order data
      if (customOrders.length > 0) {
        console.log('\n📋 Sample custom order data:');
        const sample = customOrders[0];
        console.log(`  Order Number: ${sample.order_number}`);
        console.log(`  ID: ${sample.id}`);
        console.log(`  Customer: ${sample.customer_name}`);
        console.log(`  Status: ${sample.status}`);
        console.log(`  Delivery Status: ${sample.delivery_status}`);
        console.log(`  Order Type: ${sample.order_type}`);
        console.log(`  Table Source: ${sample.table_source || 'not specified'}`);
      }
      
    } else {
      console.log('❌ API returned error:', response.data.message);
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
debugDuplicateCustomOrders();
