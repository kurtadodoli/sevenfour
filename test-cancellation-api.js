const axios = require('axios');

// Test the cancellation API endpoint exactly like the frontend would
async function testCancellationAPI() {
    try {
        console.log('🧪 Testing cancellation API endpoint...');
        
        // First, login to get a token
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'krutadodoli@gmail.com',
            password: 'password' // Replace with actual admin password
        });
        
        const token = loginResponse.data.token;
        console.log('✅ Login successful, got token');
        
        // Test 1: Try to reject cancellation request ID 9 (our test request)
        const requestId = 9;
        const action = 'reject';
        
        console.log('📤 Making cancellation API call:');
        console.log('   Endpoint:', `/api/custom-orders/cancellation-requests/${requestId}`);
        console.log('   Method: PUT');
        console.log('   Action:', JSON.stringify(action));
        console.log('   Action type:', typeof action);
        console.log('   Action length:', action.length);
        console.log('   Action character codes:', Array.from(action).map(c => c.charCodeAt(0)));
        
        const payload = {
            action,
            admin_notes: `Cancellation request ${action}d by admin on ${new Date().toLocaleString()}`
        };
        
        console.log('📤 Full payload:', JSON.stringify(payload, null, 2));
        
        const response = await axios.put(
            `http://localhost:5000/api/custom-orders/cancellation-requests/${requestId}`,
            payload,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ API call successful!');
        console.log('📥 Response:', JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.error('❌ API call failed:');
        console.error('   Status:', error.response?.status);
        console.error('   Message:', error.response?.data?.message);
        console.error('   Full error:', error.response?.data);
        console.error('   Request config:', error.config?.data);
    }
}

// Run the test
testCancellationAPI();
    console.log('✅ Admin login successful');
    console.log('User role:', loginResponse.data.user?.role);
    
    // Now test the cancellation requests endpoint
    const response = await axios.get('http://localhost:5000/api/custom-orders/cancellation-requests', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ API Response received');
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success && response.data.data.length > 0) {
      console.log('\n📋 First cancellation request details:');
      const firstRequest = response.data.data[0];
      console.log('- ID:', firstRequest.id);
      console.log('- Custom Order ID:', firstRequest.custom_order_id);
      console.log('- Customer Name:', firstRequest.customer_name);
      console.log('- Customer Email:', firstRequest.customer_email);
      console.log('- Customer Phone:', firstRequest.customer_phone);
      console.log('- Product Type:', firstRequest.product_type);
      console.log('- Product Name:', firstRequest.product_name);
      console.log('- Size:', firstRequest.size);
      console.log('- Color:', firstRequest.color);
      console.log('- Quantity:', firstRequest.quantity);
      console.log('- Estimated Price:', firstRequest.estimated_price);
      console.log('- Final Price:', firstRequest.final_price);
      console.log('- Province:', firstRequest.province);
      console.log('- Municipality:', firstRequest.municipality);
      console.log('- Street Number:', firstRequest.street_number);
      console.log('- House Number:', firstRequest.house_number);
      console.log('- Barangay:', firstRequest.barangay);
      console.log('- Postal Code:', firstRequest.postal_code);
      console.log('- Special Instructions:', firstRequest.special_instructions);
      console.log('- Reason:', firstRequest.reason);
      console.log('- Status:', firstRequest.status);
      console.log('- Created At:', firstRequest.created_at);
    } else {
      console.log('📋 No cancellation requests found or empty response');
    }
    
  } catch (error) {
    console.error('❌ Error testing cancellation API:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testCancellationAPI();
