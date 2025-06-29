// Simple Node.js HTTP test to debug the confirmed-test endpoint
const http = require('http');

function testConfirmedEndpoint() {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/orders/confirmed-test',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };

  console.log('🧪 Testing confirmed-test endpoint with raw HTTP request...');
  console.log('🌐 URL: http://localhost:5000/api/orders/confirmed-test');
  
  const req = http.request(options, (res) => {
    console.log(`📊 Status Code: ${res.statusCode}`);
    console.log(`📋 Headers:`, res.headers);
    
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('\n📄 Response Body:');
      try {
        const parsed = JSON.parse(data);
        console.log(JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.log(data);
      }
      console.log('\n✅ Test completed');
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request error:', error.message);
  });

  req.end();
}

// Run the test
testConfirmedEndpoint();
