const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testBothOrderTypes() {
  console.log('\n=== Testing Both Regular and Custom Order Refund Requests ===\n');

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
    } else {
      console.log('❌ Login failed:', loginResponse.data);
      return;
    }
  } catch (error) {
    console.log('❌ Login error:', error.response?.data || error.message);
    return;
  }

  console.log('\n--- Test 1: Regular Order Refund Request ---');
  try {
    const regularOrderPayload = {
      order_id: 42,  // Integer for regular order
      product_name: 'Regular T-Shirt',
      product_image: 'regular-tshirt.jpg',
      price: 1200.00,
      quantity: 1,
      size: 'M',
      color: 'Blue',
      phone_number: '09123456789',
      street_address: '123 Test Street',
      city_municipality: 'Test City',
      province: 'Test Province',
      reason: 'Product defect'
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
  }

  console.log('\n--- Test 2: Custom Order Refund Request ---');
  try {
    const customOrderPayload = {
      order_id: 'custom-CUSTOM-1735842094604-MCNQFDBQ',  // String for custom order
      product_name: 'Custom Design Hoodie',
      product_image: 'custom-hoodie.jpg',
      price: 2500.00,
      quantity: 1,
      size: 'L',
      color: 'Black',
      phone_number: '09987654321',
      street_address: '456 Custom Street',
      city_municipality: 'Custom City',
      province: 'Custom Province',
      reason: 'Design not as expected'
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
  }

  console.log('\n--- Test 3: Another Custom Order (Different Format) ---');
  try {
    const customOrderPayload2 = {
      order_id: 'custom-CUSTOM-1234567890-ABCDEFGH',
      product_name: 'Custom Jersey',
      product_image: 'custom-jersey.jpg',
      price: 1800.00,
      quantity: 2,
      size: 'XL',
      color: 'Red',
      phone_number: '09111222333',
      street_address: '789 Another Street',
      city_municipality: 'Another City',
      province: 'Another Province',
      reason: 'Wrong size delivered'
    };

    console.log('Payload:', JSON.stringify(customOrderPayload2, null, 2));

    const response3 = await axios.post(`${BASE_URL}/api/orders/refund-request`, customOrderPayload2, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });

    console.log('✅ Second custom order refund request successful');
    console.log('Response:', response3.data);
  } catch (error) {
    console.log('❌ Second custom order refund request failed');
    console.log('Error status:', error.response?.status);
    console.log('Error data:', error.response?.data);
  }
}

testBothOrderTypes().catch(console.error);
