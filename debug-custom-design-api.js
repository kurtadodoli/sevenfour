// Debug script to check custom design requests data
const path = require('path');
const fs = require('fs');

// Simple database connection test
console.log('🔍 Checking custom orders API endpoint...');

// Read the custom orders route file to understand the data structure
const customOrdersRoutePath = path.join(__dirname, 'server', 'routes', 'custom-orders.js');
const controllerPath = path.join(__dirname, 'server', 'controllers', 'orderController.js');

if (fs.existsSync(customOrdersRoutePath)) {
  console.log('✅ Custom orders route file exists');
  const routeContent = fs.readFileSync(customOrdersRoutePath, 'utf8');
  
  // Look for the admin/all endpoint
  const adminAllMatch = routeContent.match(/router\.get\(['"]\/admin\/all['"].*?\{([\s\S]*?)\}/);
  if (adminAllMatch) {
    console.log('✅ Found admin/all endpoint');
    console.log('Endpoint logic preview:', adminAllMatch[1].substring(0, 200) + '...');
  }
} else {
  console.log('❌ Custom orders route file not found');
}

if (fs.existsSync(controllerPath)) {
  console.log('✅ Order controller file exists');
  const controllerContent = fs.readFileSync(controllerPath, 'utf8');
  
  // Look for custom orders functions
  const customOrdersMatch = controllerContent.match(/getAllCustomOrders[\s\S]*?(?=exports\.|$)/);
  if (customOrdersMatch) {
    console.log('✅ Found getAllCustomOrders function');
    console.log('Function preview:', customOrdersMatch[0].substring(0, 300) + '...');
  }
} else {
  console.log('❌ Order controller file not found');
}

console.log('\n🔍 Checking if server is running...');

// Test if the server is running
const http = require('http');
const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/custom-orders/admin/all',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Response status:', res.statusCode);
    console.log('Response headers:', res.headers);
    console.log('Response body:', data);
  });
});

req.on('error', (error) => {
  console.error('❌ Server connection error:', error.message);
  console.log('Make sure the server is running on localhost:5000');
});

req.end();
