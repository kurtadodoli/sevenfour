const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testRefundRequests() {
  console.log('\n=== Testing Refund Request Endpoint ===\n');

  // Test 1: Regular order refund request
  console.log('Test 1: Regular Order Refund Request');
  try {
    const regularOrderPayload = {
      order_id: 42,  // Integer for regular order
      reason: 'Product defect',
      description: 'Item arrived damaged'
    };

    console.log('Payload:', JSON.stringify(regularOrderPayload, null, 2));

    const response1 = await axios.post(`${BASE_URL}/api/orders/refund-request`, regularOrderPayload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid_test_token'
      }
    });

    console.log('✅ Regular order refund request successful');
    console.log('Response:', response1.data);
  } catch (error) {
    console.log('❌ Regular order refund request failed');
    console.log('Error status:', error.response?.status);
    console.log('Error data:', error.response?.data);
  }

  console.log('\n---\n');

  // Test 2: Custom order refund request (this is what was failing)
  console.log('Test 2: Custom Order Refund Request');
  try {
    const customOrderPayload = {
      order_id: 'custom-CUSTOM-1735842094604-MCNQFDBQ',  // String for custom order
      reason: 'Design not as expected',
      description: 'The custom design does not match what was requested'
    };

    console.log('Payload:', JSON.stringify(customOrderPayload, null, 2));

    const response2 = await axios.post(`${BASE_URL}/api/orders/refund-request`, customOrderPayload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid_test_token'
      }
    });

    console.log('✅ Custom order refund request successful');
    console.log('Response:', response2.data);
  } catch (error) {
    console.log('❌ Custom order refund request failed');
    console.log('Error status:', error.response?.status);
    console.log('Error data:', error.response?.data);
    console.log('Full error:', error.message);
  }

  console.log('\n---\n');

  // Test 3: Invalid payload (no order_id)
  console.log('Test 3: Invalid Payload (no order_id)');
  try {
    const invalidPayload = {
      reason: 'Test reason',
      description: 'Test description'
    };

    console.log('Payload:', JSON.stringify(invalidPayload, null, 2));

    const response3 = await axios.post(`${BASE_URL}/api/orders/refund-request`, invalidPayload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid_test_token'
      }
    });

    console.log('Response:', response3.data);
  } catch (error) {
    console.log('Expected error for invalid payload');
    console.log('Error status:', error.response?.status);
    console.log('Error data:', error.response?.data);
  }
}

testRefundRequests().catch(console.error);
