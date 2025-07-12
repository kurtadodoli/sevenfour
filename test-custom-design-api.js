const http = require('http');

// Test the API endpoint for custom design requests
function testCustomDesignAPI() {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/custom-orders/admin/all',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // This token might be expired, but let's try
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzM2MjQ5MjI1LCJleHAiOjE3MzYzMzU2MjV9.HVlqpCYDHmzp8JdlzGEEgdCCCz22sTwU3fhGTEEE3_Y'
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('=== CUSTOM DESIGN REQUESTS API TEST ===');
      console.log('Status Code:', res.statusCode);
      
      if (res.statusCode === 200) {
        try {
          const jsonData = JSON.parse(data);
          console.log('Success:', jsonData.success);
          console.log('Data count:', jsonData.data ? jsonData.data.length : 0);
          
          if (jsonData.data && jsonData.data.length > 0) {
            console.log('\n=== FIRST CUSTOM ORDER DATA STRUCTURE ===');
            const firstOrder = jsonData.data[0];
            console.log('Keys available:', Object.keys(firstOrder));
            console.log('\nImportant fields:');
            console.log('- id:', firstOrder.id);
            console.log('- custom_order_id:', firstOrder.custom_order_id);
            console.log('- status:', firstOrder.status);
            console.log('- product_type:', firstOrder.product_type);
            console.log('- customer_name:', firstOrder.customer_name);
            console.log('- first_name:', firstOrder.first_name);
            console.log('- last_name:', firstOrder.last_name);
            console.log('- user_email:', firstOrder.user_email);
            
            console.log('\n=== BUTTON VISIBILITY CHECK ===');
            console.log('Status is pending?', firstOrder.status === 'pending');
            console.log('Should show approve/reject buttons?', firstOrder.status === 'pending' ? 'YES' : 'NO');
          }
        } catch (e) {
          console.log('Parse error:', e.message);
          console.log('Raw response:', data.substring(0, 500));
        }
      } else {
        console.log('Error response:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error('Request error:', e.message);
  });

  req.end();
}

console.log('Testing custom design requests API endpoint...');
testCustomDesignAPI();
