const axios = require('axios');

async function testAPIResponse() {
  try {
    const response = await axios.get('http://localhost:3001/api/user-designs/juan@example.com');
    console.log('✅ API Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.data && response.data.data.length > 0) {
      const order = response.data.data[0];
      console.log('\n📄 First Order Details:');
      console.log(`- Product Name: ${order.product_name || order.productName}`);
      console.log(`- Customer: ${order.first_name} ${order.last_name}`);
      console.log(`- Email: ${order.email}`);
      console.log(`- Status: ${order.status}`);
    }
  } catch (error) {
    console.error('❌ API Error:', error.message);
  }
}

testAPIResponse();
