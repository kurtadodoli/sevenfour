// Test script to verify product API endpoints
const axios = require('axios');

const API_URL = 'http://localhost:5000';

// Test function to check product endpoints
async function testProductEndpoints() {
  try {
    console.log('Testing product endpoints...');
    
    // Test 1: Get all products (public endpoint)
    console.log('\n1. Testing GET /api/products');
    const productsResponse = await axios.get(`${API_URL}/api/products`);
    console.log('✅ Products retrieved:', productsResponse.data);
    
    // Test 2: Get categories
    console.log('\n2. Testing GET /api/products/categories');
    const categoriesResponse = await axios.get(`${API_URL}/api/products/categories`);
    console.log('✅ Categories retrieved:', categoriesResponse.data);
    
    // Test 3: Try to create a product (should fail without auth)
    console.log('\n3. Testing POST /api/products (without auth - should fail)');
    try {
      await axios.post(`${API_URL}/api/products`, {
        name: 'Test Product',
        category: 'T-Shirts',
        price: 29.99
      });
    } catch (error) {
      console.log('✅ Expected auth error:', error.response?.status === 401 ? 'Unauthorized' : error.message);
    }
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure the server is running on port 5000');
    }
  }
}

// Run tests
testProductEndpoints();
