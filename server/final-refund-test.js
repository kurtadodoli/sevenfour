const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function finalRefundRequestTest() {
  console.log('\n🎯 === FINAL REFUND REQUEST TEST ===\n');
  console.log('Testing the exact scenario that was failing in the frontend...\n');

  // Login first
  console.log('Step 1: Authentication...');
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
    } else {
      console.log('❌ Login failed');
      return;
    }
  } catch (error) {
    console.log('❌ Login error:', error.message);
    return;
  }

  console.log('\n--- SCENARIO 1: Custom Order Refund (The Original Problem) ---');
  try {
    // This is the exact payload format that was causing the 500 error
    const customOrderPayload = {
      order_id: 'custom-CUSTOM-1735842094604-MCNQFDBQ',  // String with 'custom-' prefix
      custom_order_id: null,                               // null as sent by frontend
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

    console.log('📤 Sending request...');
    console.log('Payload type check:');
    console.log('  - order_id:', typeof customOrderPayload.order_id, '=', customOrderPayload.order_id);
    console.log('  - custom_order_id:', typeof customOrderPayload.custom_order_id, '=', customOrderPayload.custom_order_id);

    const response = await axios.post(`${BASE_URL}/api/orders/refund-request`, customOrderPayload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });

    console.log('✅ CUSTOM ORDER REFUND REQUEST SUCCESSFUL!');
    console.log('Response:', response.data);
    console.log('Status:', response.status);
  } catch (error) {
    console.log('❌ Custom order refund request failed');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data);
    
    if (error.response?.status === 500) {
      console.log('🚨 Still getting 500 error - the fix did not work!');
    }
  }

  console.log('\n--- SCENARIO 2: Regular Order Refund (Should Also Work) ---');
  try {
    const regularOrderPayload = {
      order_id: 42,  // Integer for regular order
      product_name: 'Regular Product',
      product_image: 'regular-product.jpg',
      price: 1500.00,
      quantity: 1,
      size: 'M',
      color: 'Blue',
      phone_number: '09987654321',
      street_address: '456 Regular Street',
      city_municipality: 'Regular City',
      province: 'Regular Province',
      reason: 'Product defect'
    };

    console.log('📤 Sending request...');
    console.log('Payload type check:');
    console.log('  - order_id:', typeof regularOrderPayload.order_id, '=', regularOrderPayload.order_id);

    const response = await axios.post(`${BASE_URL}/api/orders/refund-request`, regularOrderPayload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });

    console.log('✅ REGULAR ORDER REFUND REQUEST SUCCESSFUL!');
    console.log('Response:', response.data);
    console.log('Status:', response.status);
  } catch (error) {
    console.log('❌ Regular order refund request failed');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data);
  }

  console.log('\n--- SCENARIO 3: Edge Case - Different Custom Order Format ---');
  try {
    const edgeCasePayload = {
      order_id: 'custom-DIFFERENT-FORMAT-123456789',
      product_name: 'Edge Case Product',
      product_image: 'edge-case.jpg',
      price: 999.99,
      quantity: 2,
      reason: 'Testing edge case'
    };

    const response = await axios.post(`${BASE_URL}/api/orders/refund-request`, edgeCasePayload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });

    console.log('✅ EDGE CASE REFUND REQUEST SUCCESSFUL!');
    console.log('Response:', response.data);
  } catch (error) {
    console.log('❌ Edge case refund request failed');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data);
  }

  console.log('\n🎉 === TEST SUMMARY ===');
  console.log('If all scenarios above show ✅ SUCCESS, then the fix is complete!');
  console.log('The frontend should now be able to submit refund requests for both:');
  console.log('  1. Regular orders (with integer order_id)');
  console.log('  2. Custom orders (with string order_id starting with "custom-")');
  console.log('\nThe 500 Internal Server Error should be resolved! 🚀');
}

finalRefundRequestTest().catch(console.error);
