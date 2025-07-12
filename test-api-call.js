const http = require('http');

// Simulate an API call to the pending verification endpoint
function makeAPICall() {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/orders/pending-verification',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // Using a test admin token - this would normally come from the frontend auth
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzM2MjQ5MjI1LCJleHAiOjE3MzYzMzU2MjV9.HVlqpCYDHmzp8JdlzGEEgdCCCz22sTwU3fhGTEEE3_Y'
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('=== API RESPONSE ===');
      console.log('Status Code:', res.statusCode);
      console.log('Headers:', res.headers);
      
      try {
        const jsonData = JSON.parse(data);
        console.log('Success:', jsonData.success);
        console.log('Data count:', jsonData.data ? jsonData.data.length : 0);
        
        if (jsonData.data && jsonData.data.length > 0) {
          jsonData.data.forEach(order => {
            console.log(`\nOrder ${order.order_number}:`);
            console.log(`  - Status: ${order.status}`);
            console.log(`  - Payment Status: ${order.payment_status}`);
            console.log(`  - Total: ${order.total_amount}`);
          });
        }
      } catch (e) {
        console.log('Raw response:', data.substring(0, 500));
        console.log('Parse error:', e.message);
      }
    });
  });

  req.on('error', (e) => {
    console.error('Request error:', e.message);
  });

  req.end();
}

console.log('Testing API call to pending verification endpoint...');
makeAPICall();
