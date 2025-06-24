const axios = require('axios');

async function debugCustomOrdersIssue() {
  console.log('🔍 Debugging Custom Orders Display Issue\n');

  try {
    // Step 1: Check what custom orders exist in the database
    console.log('1️⃣ Checking existing custom orders in database...');
    
    const emails = ['john.doe@test.com', 'juan@example.com', 'testuser@example.com'];
    
    for (const email of emails) {
      try {
        const response = await axios.get(`http://localhost:3001/api/user-designs/${encodeURIComponent(email)}`);
        if (response.data.success && response.data.data.length > 0) {
          console.log(`✅ ${email}: Found ${response.data.data.length} orders`);
          console.log(`   First order: ${response.data.data[0].custom_order_id} - ${response.data.data[0].customer_name}`);
        } else {
          console.log(`📭 ${email}: No orders found`);
        }
      } catch (error) {
        console.log(`❌ ${email}: Error - ${error.response?.status || 'Connection failed'}`);
      }
    }

    // Step 2: Test a simple custom order submission to see what email is used
    console.log('\n2️⃣ Testing custom order submission...');
    
    const testOrder = {
      customer_name: 'Debug Test User',
      customer_email: 'debug@test.com',
      customer_phone: '09123456789',
      product_type: 't-shirts',
      product_name: 'Debug Test Shirt',
      product_size: 'M',
      product_color: 'Blue',
      quantity: 1,
      additional_info: 'Debug test order to check email handling',
      street_address: '123 Debug Street',
      city: 'Manila'
    };

    try {
      const submitResponse = await axios.post('http://localhost:3001/api/custom-designs', testOrder);
      console.log('✅ Custom order submitted successfully');
      console.log(`   Order ID: ${submitResponse.data.design_id}`);
      console.log(`   Customer Email: ${testOrder.customer_email}`);
      
      // Immediately fetch it back
      console.log('\n3️⃣ Fetching the just-submitted order...');
      const fetchResponse = await axios.get(`http://localhost:3001/api/user-designs/${encodeURIComponent(testOrder.customer_email)}`);
      
      if (fetchResponse.data.success && fetchResponse.data.data.length > 0) {
        console.log(`✅ Successfully fetched ${fetchResponse.data.data.length} orders for ${testOrder.customer_email}`);
        const latestOrder = fetchResponse.data.data.find(order => order.custom_order_id === submitResponse.data.design_id);
        if (latestOrder) {
          console.log(`✅ Found the just-submitted order!`);
          console.log(`   Email in DB: ${latestOrder.customer_email || latestOrder.email}`);
        }
      }
      
    } catch (error) {
      console.log('❌ Error submitting/fetching test order:', error.response?.data || error.message);
    }

    // Step 4: Test what emails the frontend tries to use
    console.log('\n4️⃣ Testing various email detection scenarios...');
    
    // Simulate what the frontend would try
    const possibleEmails = [
      'john.doe@test.com',  // Known to have orders
      'testuser@example.com',
      'user@test.com',
      'debug@test.com'      // Just created
    ];

    console.log('Testing emails that OrderPage.js would try:');
    for (const email of possibleEmails) {
      try {
        const response = await axios.get(`http://localhost:3001/api/user-designs/${encodeURIComponent(email)}`);
        const count = response.data.success ? response.data.data.length : 0;
        console.log(`   ${email}: ${count} orders found`);
      } catch (error) {
        console.log(`   ${email}: API error`);
      }
    }

  } catch (error) {
    console.error('❌ Debug Error:', error.message);
  }
}

debugCustomOrdersIssue();
