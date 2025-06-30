const axios = require('axios');

async function testCourierCRUD() {
  try {
    console.log('Testing complete courier CRUD operations...');
    
    // Test 1: Create a new courier
    console.log('\n1. Creating a new courier...');
    const createResponse = await axios.post('http://localhost:5000/api/couriers', {
      name: 'Test Courier',
      phone_number: '639123456789',
      email: 'test@example.com',
      license_number: 'TEST123',
      vehicle_type: 'motorcycle',
      max_deliveries_per_day: 15,
      service_areas: ['Quezon City', 'Makati'],
      notes: 'Test courier for validation'
    });
    
    console.log('Create successful:', createResponse.data.success);
    const newCourierId = createResponse.data.courier.id;
    console.log('New courier ID:', newCourierId);
    
    // Test 2: Update the courier status
    console.log('\n2. Updating courier status...');
    const updateResponse = await axios.put(`http://localhost:5000/api/couriers/${newCourierId}`, {
      status: 'busy'
    });
    
    console.log('Update successful:', updateResponse.data.success);
    console.log('New status:', updateResponse.data.courier.status);
    
    // Test 3: Update multiple fields
    console.log('\n3. Updating multiple fields...');
    const multiUpdateResponse = await axios.put(`http://localhost:5000/api/couriers/${newCourierId}`, {
      name: 'Updated Test Courier',
      max_deliveries_per_day: 20,
      notes: 'Updated notes'
    });
    
    console.log('Multi-update successful:', multiUpdateResponse.data.success);
    console.log('Updated name:', multiUpdateResponse.data.courier.name);
    console.log('Updated max deliveries:', multiUpdateResponse.data.courier.max_deliveries_per_day);
    
    // Test 4: Try to delete (should work since no active deliveries)
    console.log('\n4. Testing deletion...');
    const deleteResponse = await axios.delete(`http://localhost:5000/api/couriers/${newCourierId}`);
    
    console.log('Delete successful:', deleteResponse.data.success);
    console.log('Delete message:', deleteResponse.data.message);
    
    console.log('\n✅ All CRUD operations successful!');
    
  } catch (error) {
    console.error('\n❌ Error in CRUD operations:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message);
    console.error('Error:', error.response?.data?.error);
    console.error('Full response:', error.response?.data);
  }
}

testCourierCRUD();
