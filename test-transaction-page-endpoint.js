const axios = require('axios');

async function testTransactionPageEndpoint() {
  try {
    console.log('🔍 Testing TransactionPage endpoint for confirmed orders...\n');
    
    // Test the delivery-enhanced endpoint that TransactionPage uses
    const response = await axios.get('http://localhost:5000/api/delivery-enhanced/orders');
    
    if (response.data.success) {
      const orders = response.data.data.orders || response.data.data;
      
      // Find our specific order
      const specificOrder = orders.find(order => 
        order.order_number === 'ORD17517265241588952'
      );
      
      if (specificOrder) {
        console.log('✅ SUCCESS: Order found in delivery-enhanced endpoint!');
        console.log('Order details:');
        console.log('   Order Number:', specificOrder.order_number);
        console.log('   Order Type:', specificOrder.order_type);
        console.log('   Status:', specificOrder.status);
        console.log('   Customer Name:', specificOrder.customer_name);
        console.log('   Total Amount:', specificOrder.total_amount);
        console.log('   Delivery Status:', specificOrder.delivery_status);
      } else {
        console.log('❌ Order NOT found in delivery-enhanced endpoint');
        
        // Show total orders found
        console.log(`\nTotal orders returned: ${orders.length}`);
        console.log('Sample order numbers:', orders.slice(0, 5).map(o => o.order_number));
      }
    } else {
      console.log('❌ API call failed:', response.data);
    }
    
  } catch (error) {
    console.error('❌ Error testing endpoint:', error.message);
    
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', error.response.data);
    }
  }
}

testTransactionPageEndpoint();
