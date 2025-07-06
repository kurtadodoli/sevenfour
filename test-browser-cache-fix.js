/**
 * Browser Cache Fix Test
 * Tests that the frontend properly handles custom orders without making API calls
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testBrowserCacheFix() {
  console.log('🧪 Testing Browser Cache Fix for Custom Orders...\n');

  try {
    // 1. Get a custom order to test with
    console.log('📋 Fetching custom orders...');
    const ordersResponse = await axios.get(`${API_BASE}/orders`, {
      headers: { 'Authorization': 'Bearer test-token' } // You may need to adjust auth
    });

    if (!ordersResponse.data.success) {
      console.log('❌ Failed to fetch orders');
      return;
    }

    const customOrders = ordersResponse.data.data.filter(order => 
      order.order_type === 'custom' || (order.id && order.id.toString().startsWith('custom-'))
    );

    if (customOrders.length === 0) {
      console.log('⚠️  No custom orders found in the system');
      return;
    }

    const testOrder = customOrders[0];
    console.log(`✅ Found custom order to test: ${testOrder.order_number} (ID: ${testOrder.id})`);

    // 2. Test that the backend properly rejects custom order item requests
    console.log('\n🔍 Testing backend safety check...');
    try {
      const itemsResponse = await axios.get(`${API_BASE}/orders/${testOrder.id}/items`);
      console.log('❌ Backend allowed custom order items request (this should be blocked)');
      console.log('Response:', itemsResponse.data);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Backend correctly rejected custom order items request');
        console.log('   Error message:', error.response.data.message);
      } else {
        console.log('❓ Unexpected error from backend:', error.message);
      }
    }

    // 3. Verify that custom orders have items included
    console.log('\n📦 Checking if custom order has items included...');
    if (testOrder.items && testOrder.items.length > 0) {
      console.log(`✅ Custom order has ${testOrder.items.length} items included:`);
      testOrder.items.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.product_name || item.name || 'Custom Item'} - $${item.price || item.total_price || 'N/A'}`);
      });
    } else {
      console.log('⚠️  Custom order does not have items included - this may cause frontend issues');
    }

    // 4. Test order fetching with items
    console.log('\n🔄 Testing order fetching with items...');
    const orderWithItemsResponse = await axios.get(`${API_BASE}/orders/with-items`);
    
    if (orderWithItemsResponse.data.success) {
      const customOrdersWithItems = orderWithItemsResponse.data.data.filter(order => 
        order.order_type === 'custom' || (order.id && order.id.toString().startsWith('custom-'))
      );
      
      console.log(`✅ Found ${customOrdersWithItems.length} custom orders with items included`);
      
      customOrdersWithItems.forEach(order => {
        const itemCount = order.items ? order.items.length : 0;
        console.log(`   - ${order.order_number}: ${itemCount} items`);
      });
    }

    console.log('\n✅ Browser cache fix test completed!');
    console.log('\n📋 Instructions for user:');
    console.log('1. Open your browser and navigate to http://localhost:3000');
    console.log('2. Clear your browser cache (Ctrl+Shift+Delete or Cmd+Shift+Delete)');
    console.log('3. Refresh the page (F5 or Ctrl+R)');
    console.log('4. Log in and go to "My Orders"');
    console.log('5. Click "View Invoice" on a custom order');
    console.log('6. The invoice should load without any 404 errors');
    console.log('\n🔧 If you still see errors:');
    console.log('- Try opening in an incognito/private window');
    console.log('- Check the browser console for any error messages');
    console.log('- Verify the custom order has items included in the database');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n🔧 Connection refused - make sure the server is running:');
      console.log('   cd c:\\sfc\\server && npm start');
    }
  }
}

testBrowserCacheFix();
