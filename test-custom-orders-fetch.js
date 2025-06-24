const axios = require('axios');

async function testCustomOrdersFetch() {
  try {
    console.log('🧪 Testing Custom Orders Fetch...\n');

    // Test different user emails that might exist
    const testEmails = [
      'john.doe@test.com', // From the submission
      'testuser@example.com',
      'juan@example.com',
      'alice@example.com'
    ];

    for (const email of testEmails) {
      console.log(`🔍 Testing endpoint for: ${email}`);
      try {
        const response = await axios.get(`http://localhost:3001/api/user-designs/${encodeURIComponent(email)}`);
        console.log(`✅ ${email}: Found ${response.data.data.length} orders`);
        if (response.data.data.length > 0) {
          const firstOrder = response.data.data[0];
          console.log(`   📄 Sample: ${firstOrder.custom_order_id} - ${firstOrder.customer_name}`);
        }
      } catch (error) {
        console.log(`❌ ${email}: ${error.response?.status || 'Connection failed'}`);
      }
      console.log(''); // Empty line for readability
    }

    // Check what was actually inserted in the database
    console.log('📊 Checking recent database entries...');
    const recentResponse = await axios.get('http://localhost:3001/api/custom-designs?limit=5');
    if (recentResponse.data.success) {
      console.log(`Found ${recentResponse.data.data.designs.length} recent designs:`);
      recentResponse.data.data.designs.forEach(design => {
        console.log(`   📄 ${design.design_id}: ${design.customer_name} (${design.email}) - ${design.status}`);
      });
    }

  } catch (error) {
    console.error('❌ Test Error:', error.message);
  }
}

testCustomOrdersFetch();
