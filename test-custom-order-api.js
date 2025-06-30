const axios = require('axios');

async function testCustomOrderAPI() {
  try {
    console.log('🧪 Testing custom order delivery status API endpoint...');
    
    // First, let's get a custom order to test with
    console.log('📋 Getting custom orders...');
    
    // We need to authenticate first - let's check if there are any custom orders
    const mysql = require('mysql2/promise');
    
    const dbConfig = {
      host: 'localhost',
      user: 'root',
      password: 's3v3n-f0ur-cl0thing*',
      database: 'seven_four_clothing'
    };
    
    const connection = await mysql.createConnection(dbConfig);
    
    // Get a sample custom order
    const [customOrders] = await connection.execute(`
      SELECT id, custom_order_id, customer_name, status, delivery_status 
      FROM custom_orders 
      WHERE status = 'approved' 
      LIMIT 1
    `);
    
    if (customOrders.length === 0) {
      console.log('❌ No approved custom orders found to test with');
      await connection.end();
      return;
    }
    
    const testOrder = customOrders[0];
    console.log('📦 Found test order:', {
      id: testOrder.id,
      custom_order_id: testOrder.custom_order_id,
      customer_name: testOrder.customer_name,
      status: testOrder.status,
      delivery_status: testOrder.delivery_status
    });
    
    await connection.end();
    
    // Now test the API endpoint
    console.log('\n🌐 Testing API endpoint...');
    console.log(`Testing: PATCH /custom-orders/${testOrder.id}/delivery-status`);
    
    const testData = {
      delivery_status: 'in_transit',
      delivery_date: null,
      delivery_notes: 'Test update from API test script'
    };
    
    console.log('📤 Request data:', testData);
    
    // Make the API call
    try {
      const response = await axios.patch(
        `http://localhost:3000/api/custom-orders/${testOrder.id}/delivery-status`,
        testData,
        {
          headers: {
            'Content-Type': 'application/json',
            // Note: This test doesn't include authentication - that might be the issue
          },
          timeout: 5000
        }
      );
      
      console.log('✅ API Response:', response.data);
      
    } catch (apiError) {
      console.log('❌ API Error Details:');
      console.log('Status:', apiError.response?.status);
      console.log('Status Text:', apiError.response?.statusText);
      console.log('Response Data:', apiError.response?.data);
      console.log('Error Message:', apiError.message);
      
      if (apiError.response?.status === 401 || apiError.response?.status === 403) {
        console.log('\n💡 This appears to be an authentication issue!');
        console.log('The API endpoint requires admin authentication.');
      }
    }
    
  } catch (error) {
    console.error('❌ Script error:', error.message);
  }
}

testCustomOrderAPI();
