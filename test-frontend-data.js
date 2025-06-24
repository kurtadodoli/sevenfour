const axios = require('axios');

// Test with data similar to what the frontend would send
async function testFrontendLikeData() {
  console.log('🧪 Testing with frontend-like data structure...');
  
  // Simulating a typical order object from the frontend
  const mockOrder = {
    id: "custom-order-123",  // This might be causing issues
    order_number: "ORD-2025-001",
    order_type: "custom",
    user_id: "967502321335185",  // String instead of number
    customer_id: undefined,
    customerName: "John Doe",
    shipping_address: "123 Main Street",
    city: "Manila",
    contact_phone: "+63-912-345-6789"
  };
  
  const scheduleData = {
    date: "2025-06-25",
    time: "9:00-12:00",
    notes: "Please call before delivery"
  };
  
  // Process the data like the frontend does
  let customerId = null;
  if (mockOrder.user_id) {
    customerId = mockOrder.user_id;
  } else if (mockOrder.customer_id) {
    customerId = mockOrder.customer_id;
  } else {
    customerId = 1;
  }
  
  let processedOrderId;
  if (mockOrder.id && mockOrder.id.toString().includes('-')) {
    const parts = mockOrder.id.split('-');
    processedOrderId = parseInt(parts[parts.length - 1]) || Math.floor(Math.random() * 1000000);
  } else if (mockOrder.id) {
    processedOrderId = parseInt(mockOrder.id) || Math.floor(Math.random() * 1000000);
  } else {
    processedOrderId = Math.floor(Math.random() * 1000000);
  }
  
  const deliveryAddress = mockOrder.shipping_address || mockOrder.address || mockOrder.customer_address || 'Address not provided';
  
  const deliveryScheduleData = {
    order_id: processedOrderId,
    order_type: mockOrder.order_type === 'custom_design' ? 'custom' : (mockOrder.order_type || 'regular'),
    customer_id: customerId,
    delivery_date: scheduleData.date,
    delivery_time_slot: scheduleData.time || '9:00-17:00',
    delivery_address: deliveryAddress,
    delivery_city: mockOrder.city || mockOrder.shipping_city || 'Manila',
    delivery_postal_code: mockOrder.postal_code || mockOrder.shipping_postal_code || '1000',
    delivery_province: mockOrder.province || mockOrder.shipping_province || 'Metro Manila',
    delivery_contact_phone: mockOrder.contact_phone || mockOrder.customer_phone || mockOrder.phone || '',
    delivery_notes: scheduleData.notes || '',
    priority_level: (mockOrder.priority && mockOrder.priority > 50) ? 'high' : 'normal',
    delivery_fee: 150.00
  };

  console.log('📋 Processed order data (like frontend would do):');
  console.log('Original order.id:', mockOrder.id);
  console.log('Processed order_id:', processedOrderId);
  console.log('Original user_id:', mockOrder.user_id, typeof mockOrder.user_id);
  console.log('Processed customer_id:', customerId, typeof customerId);
  console.log();
  console.log('📤 Final delivery schedule data to send:');
  console.log(JSON.stringify(deliveryScheduleData, null, 2));

  try {
    const response = await axios.post('http://localhost:3001/api/delivery/schedules', deliveryScheduleData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Success! Response:', response.data);
    
  } catch (error) {
    console.error('❌ Error details:');
    console.error('- Status:', error.response?.status);
    console.error('- Status Text:', error.response?.statusText);
    console.error('- Error Message:', error.message);
    console.error('- Response Data:', JSON.stringify(error.response?.data, null, 2));
  }
}

testFrontendLikeData();
