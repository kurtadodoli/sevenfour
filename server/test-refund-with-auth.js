const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testRefundRequestsWithAuth() {
  console.log('\n=== Testing Refund Request Endpoint with Authentication ===\n');

  // First, login to get a valid token
  console.log('Step 1: Logging in...');
  let authToken;
  
  try {
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'test@admin.com',
      password: 'admin123'
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    if (loginResponse.data.success) {
      authToken = loginResponse.data.data.token;
      console.log('✅ Login successful');
      console.log('Token:', authToken.substring(0, 20) + '...');
    } else {
      console.log('❌ Login failed:', loginResponse.data);
      return;
    }
  } catch (error) {
    console.log('❌ Login error:', error.response?.data || error.message);
    return;
  }

  console.log('\n---\n');

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
        'Authorization': `Bearer ${authToken}`
      }
    });

    console.log('✅ Regular order refund request successful');
    console.log('Response:', response1.data);
  } catch (error) {
    console.log('❌ Regular order refund request failed');
    console.log('Error status:', error.response?.status);
    console.log('Error data:', error.response?.data);
    if (error.response?.status === 500) {
      console.log('🔍 This is a 500 Internal Server Error - checking logs...');
    }
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
        'Authorization': `Bearer ${authToken}`
      }
    });

    console.log('✅ Custom order refund request successful');
    console.log('Response:', response2.data);
  } catch (error) {
    console.log('❌ Custom order refund request failed');
    console.log('Error status:', error.response?.status);
    console.log('Error data:', error.response?.data);
    console.log('Full error message:', error.message);
    if (error.response?.status === 500) {
      console.log('🔍 This is a 500 Internal Server Error - the exact error from frontend logs!');
    }
  }

  console.log('\n---\n');

  // Test 3: Test the exact frontend payload format
  console.log('Test 3: Frontend-style Payload');
  try {
    const frontendStylePayload = {
      order_id: 'custom-CUSTOM-1735842094604-MCNQFDBQ',
      custom_order_id: null,
      product_name: 'Custom Design T-Shirt',
      product_image: 'custom-design.jpg',
      price: 2500.00,
      quantity: 1,
      size: 'L',
      color: 'Black',
      phone_number: '09123456789',
      street_address: '123 Test Street',
      city_municipality: 'Test City',
      province: 'Test Province',
      reason: 'Design not as expected'
    };

    console.log('Payload:', JSON.stringify(frontendStylePayload, null, 2));

    const response3 = await axios.post(`${BASE_URL}/api/orders/refund-request`, frontendStylePayload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });

    console.log('✅ Frontend-style refund request successful');
    console.log('Response:', response3.data);
  } catch (error) {
    console.log('❌ Frontend-style refund request failed');
    console.log('Error status:', error.response?.status);
    console.log('Error data:', error.response?.data);
    console.log('Full error message:', error.message);
    if (error.response?.status === 500) {
      console.log('🔍 This matches the exact frontend error!');
    }
  }
}

testRefundRequestsWithAuth().catch(console.error);
