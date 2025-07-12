const axios = require('axios');

// Test the admin tables APIs
async function testAdminTablesAPIs() {
  console.log('🔍 Testing Admin Tables APIs...\n');
  
  try {
    // Test Cancellation Requests API
    console.log('📝 Testing Cancellation Requests API...');
    const cancellationResponse = await axios.get('http://localhost:5000/api/custom-orders/cancellation-requests');
    console.log('✅ Cancellation Requests API Response:');
    console.log('Status:', cancellationResponse.status);
    console.log('Data count:', cancellationResponse.data.length);
    if (cancellationResponse.data.length > 0) {
      console.log('Sample record fields:', Object.keys(cancellationResponse.data[0]));
      console.log('Sample record:', cancellationResponse.data[0]);
    }
    console.log('');
    
    // Test Custom Design Requests API
    console.log('🎨 Testing Custom Design Requests API...');
    const designResponse = await axios.get('http://localhost:5000/api/custom-orders/all');
    console.log('✅ Custom Design Requests API Response:');
    console.log('Status:', designResponse.status);
    console.log('Data count:', designResponse.data.length);
    if (designResponse.data.length > 0) {
      console.log('Sample record fields:', Object.keys(designResponse.data[0]));
      console.log('Sample record:', designResponse.data[0]);
    }
    console.log('');
    
    // Test Refund Requests API
    console.log('💰 Testing Refund Requests API...');
    const refundResponse = await axios.get('http://localhost:5000/api/refunds');
    console.log('✅ Refund Requests API Response:');
    console.log('Status:', refundResponse.status);
    console.log('Data count:', refundResponse.data.length);
    if (refundResponse.data.length > 0) {
      console.log('Sample record fields:', Object.keys(refundResponse.data[0]));
      console.log('Sample record:', refundResponse.data[0]);
    }
    console.log('');
    
  } catch (error) {
    console.error('❌ Error testing APIs:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testAdminTablesAPIs();
