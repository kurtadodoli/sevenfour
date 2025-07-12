// Debug order number display in cancellation requests
const test = () => {
  // Mock regular order cancellation request (similar to what we get from backend)
  const mockRegularRequest = {
    id: 123,
    order_id: 'ORDER_456',
    transaction_id: 'TXN_789',
    customer_name: 'John Doe',
    customer_email: 'john@example.com',
    status: 'pending',
    reason: 'Changed mind',
    // Note: no order_number field directly
  };

  // Simulate the mapping process from TransactionPage.js
  const mappedRequest = {
    ...mockRegularRequest,
    order_type: 'regular',
    request_type: 'regular_order_cancellation',
    
    // This is the mapping logic from line 1768
    order_number: mockRegularRequest.order_number || mockRegularRequest.order_id || mockRegularRequest.transaction_id || mockRegularRequest.id,
    
    customer_name: mockRegularRequest.customer_name || mockRegularRequest.user_name || mockRegularRequest.full_name,
    customer_email: mockRegularRequest.customer_email || mockRegularRequest.user_email || mockRegularRequest.email,
    customer_phone: mockRegularRequest.customer_phone || mockRegularRequest.phone || mockRegularRequest.contact_phone,
    
    product_type: mockRegularRequest.product_type || mockRegularRequest.product_name || 'Regular Order',
    total_amount: mockRegularRequest.total_amount || mockRegularRequest.amount || mockRegularRequest.order_total || 0
  };

  console.log('Original request:', mockRegularRequest);
  console.log('Mapped request:', mappedRequest);
  console.log('Order number fallback chain:');
  console.log('  - order_number:', mockRegularRequest.order_number);
  console.log('  - order_id:', mockRegularRequest.order_id);
  console.log('  - transaction_id:', mockRegularRequest.transaction_id);
  console.log('  - id:', mockRegularRequest.id);
  console.log('Final order_number:', mappedRequest.order_number);
  
  // Test the display logic
  const displayOrderNumber = mappedRequest.order_number || mappedRequest.custom_order_id;
  console.log('Display order number (expanded row logic):', displayOrderNumber);
  
  // Test what should happen with safeDisplayValue
  const safeDisplayValue = (value, fallback) => {
    if (value === null || value === undefined || value === '') {
      return fallback;
    }
    return value;
  };
  
  console.log('With safeDisplayValue:', safeDisplayValue(displayOrderNumber, 'No Order Number'));
};

test();
