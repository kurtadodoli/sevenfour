// Test script to verify delivery API endpoints
const http = require('http');

async function testDeliveryAPI() {
  console.log('🔍 Testing Enhanced Delivery API endpoints...');
  
  const endpoints = [
    '/api/delivery-enhanced/orders',
    '/api/delivery-enhanced/calendar', 
    '/api/couriers',
    '/delivery/schedules'
  ];
  
  for (const endpoint of endpoints) {
    await new Promise((resolve) => {
      console.log(`📦 Testing ${endpoint}...`);
      
      const req = http.request({
        hostname: 'localhost',
        port: 5000,
        path: endpoint,
        method: 'GET'
      }, (res) => {
        console.log(`   Status: ${res.statusCode}`);
        
        if (res.statusCode === 404) {
          console.log(`   ❌ ${endpoint} not found`);
        } else if (res.statusCode === 401) {
          console.log(`   ✅ ${endpoint} exists but requires auth`);
        } else {
          console.log(`   ✅ ${endpoint} is accessible`);
        }
        
        res.on('data', () => {});
        res.on('end', () => {
          console.log('');
          resolve();
        });
      });
      
      req.on('error', (error) => {
        console.log(`   ❌ ${endpoint} error:`, error.message);
        console.log('');
        resolve();
      });
      
      req.end();
    });
  }
  
  console.log('✅ API test completed!');
}

testDeliveryAPI().catch(console.error);
