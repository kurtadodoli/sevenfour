const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function testApiEndpoint() {
  console.log('=== TESTING DELIVERY API ENDPOINT ===\n');
  
  try {
    // Test the actual API endpoint
    const fetch = require('node-fetch');
    const response = await fetch('http://localhost:3001/api/delivery-enhanced/orders');
    
    if (!response.ok) {
      console.error(`❌ API request failed: ${response.status} ${response.statusText}`);
      return;
    }
    
    const data = await response.json();
    
    console.log('✅ API endpoint responded successfully');
    console.log(`📊 Total regular orders: ${data.data?.regularOrders?.length || 0}`);
    console.log(`📊 Total custom orders: ${data.data?.customOrders?.length || 0}`);
    
    // Look for our specific order
    const regularOrders = data.data?.regularOrders || [];
    const targetOrder = regularOrders.find(order => order.order_number === 'ORD17517282369104816');
    
    if (targetOrder) {
      console.log('\n✅ ORDER FOUND IN API RESPONSE!');
      console.log('📋 Order Details from API:');
      console.log(`- ID: ${targetOrder.id}`);
      console.log(`- Order Number: ${targetOrder.order_number}`);
      console.log(`- Customer: ${targetOrder.customer_name} (${targetOrder.customer_email})`);
      console.log(`- Status: ${targetOrder.status}`);
      console.log(`- Total: ${targetOrder.total_amount}`);
      console.log(`- Delivery Status: ${targetOrder.delivery_status}`);
    } else {
      console.log('\n❌ ORDER NOT FOUND IN API RESPONSE');
      console.log('First 3 orders in response:');
      regularOrders.slice(0, 3).forEach((order, index) => {
        console.log(`${index + 1}. ${order.order_number} - ${order.customer_name} - ${order.status}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error testing API endpoint:', error.message);
    
    // If the API is not running, let's just check if the server is supposed to be running
    console.log('\n🔍 Is the server running on port 3001?');
    console.log('You might need to start the server first with: npm start');
  }
}

testApiEndpoint();
