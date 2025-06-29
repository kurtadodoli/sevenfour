const axios = require('axios');

async function testCourierUpdate() {
  try {
    console.log('Testing courier update API...');
    
    // First get couriers to see what exists
    const getCouriers = await axios.get('http://localhost:5000/api/couriers');
    console.log('Available couriers:', getCouriers.data.length);
    
    if (getCouriers.data.length > 0) {
      const firstCourier = getCouriers.data[0];
      console.log('Testing with courier:', firstCourier.id, firstCourier.name);
      
      // Try to update status
      const updateResponse = await axios.put(`http://localhost:5000/api/couriers/${firstCourier.id}`, {
        status: 'offline'
      });
      
      console.log('Update successful:', updateResponse.data);
    }
    
  } catch (error) {
    console.error('Error details:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message);
    console.error('Error:', error.response?.data?.error);
    console.error('Full response:', error.response?.data);
  }
}

testCourierUpdate();
