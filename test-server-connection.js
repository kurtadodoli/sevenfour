// Simple test to check if server is accessible
const http = require('http');

function testServerConnection() {
  console.log('🔄 Testing server connectivity...');
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/delivery-enhanced/orders',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  const req = http.request(options, (res) => {
    console.log(`✅ Server responded with status: ${res.statusCode}`);
    console.log(`📥 Headers:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('📥 Response body length:', data.length);
      if (data.length < 1000) {
        console.log('📥 Response body:', data);
      } else {
        console.log('📥 Response body (truncated):', data.substring(0, 500) + '...');
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('❌ Server connection failed:', error.message);
  });
  
  req.end();
}

// Test server connection
testServerConnection();
