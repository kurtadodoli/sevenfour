// Simple test to check if the server is running and accessible
const axios = require('axios');

async function checkServerStatus() {
  try {
    console.log('🔍 Checking server status...');
    
    // Test basic server connectivity
    const healthResponse = await axios.get('http://localhost:3001/api/health', { timeout: 5000 });
    console.log('✅ Server health check:', healthResponse.status);
    
  } catch (healthError) {
    console.log('❌ Health check failed:', healthError.message);
    
    // Try a simpler endpoint
    try {
      const basicResponse = await axios.get('http://localhost:3001/', { timeout: 5000 });
      console.log('✅ Basic server response:', basicResponse.status);
    } catch (basicError) {
      console.log('❌ Server appears to be down:', basicError.message);
      return;
    }
  }
  
  // Test custom designs route with GET request
  try {
    console.log('\n🧪 Testing custom designs endpoint (GET)...');
    const getResponse = await axios.get('http://localhost:3001/api/custom-designs', { timeout: 5000 });
    console.log('✅ Custom designs GET endpoint working:', getResponse.status);
  } catch (getError) {
    console.log('❌ Custom designs GET failed:', getError.response?.status, getError.response?.data?.message || getError.message);
  }
  
  // Test database connectivity through a simple endpoint
  try {
    console.log('\n🧪 Testing database connectivity...');
    const dbResponse = await axios.get('http://localhost:3001/api/user-designs/test@example.com', { timeout: 5000 });
    console.log('✅ Database endpoint working:', dbResponse.status);
  } catch (dbError) {
    console.log('❌ Database endpoint failed:', dbError.response?.status, dbError.response?.data?.message || dbError.message);
  }
}

checkServerStatus();
