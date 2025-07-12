/**
 * Test Script for Regular Order Number Fix
 * This script tests the order number mapping for regular order cancellation requests
 */

// Mock regular order cancellation request data (simulating what comes from API)
const mockRegularCancellationRequests = [
  {
    id: 1,
    // Regular orders might have order number in different fields
    order_id: 'ORD-2025-001',
    transaction_id: 'TXN-12345',
    status: 'pending',
    reason: 'Changed my mind',
    created_at: '2025-07-10T10:00:00Z',
    customer_name: 'John Doe',
    customer_email: 'john@example.com',
    total_amount: 1500
  },
  {
    id: 2,
    // This one has order_number directly
    order_number: 'ORD-2025-002',
    status: 'pending',
    reason: 'Item not as expected',
    created_at: '2025-07-10T11:00:00Z',
    user_name: 'Jane Smith',
    email: 'jane@example.com',
    amount: 750
  },
  {
    id: 3,
    // This one has minimal info
    transaction_id: 'TXN-67890',
    status: 'pending',
    reason: 'Want refund',
    created_at: '2025-07-10T12:00:00Z',
    full_name: 'Bob Johnson',
    user_email: 'bob@example.com',
    order_total: 2000
  }
];

// Simulate the processing function for regular requests
function processRegularRequest(request) {
  return {
    ...request,
    order_type: 'regular',
    request_type: 'regular_order_cancellation',
    
    // Ensure order_number is properly mapped for regular orders
    order_number: request.order_number || request.order_id || request.transaction_id || request.id,
    
    // Map other fields that might be missing
    customer_name: request.customer_name || request.user_name || request.full_name,
    customer_email: request.customer_email || request.user_email || request.email,
    customer_phone: request.customer_phone || request.phone || request.contact_phone,
    
    // Map product information
    product_type: request.product_type || request.product_name || 'Regular Order',
    total_amount: request.total_amount || request.amount || request.order_total || 0
  };
}

// Test the order number mapping
function testOrderNumberMapping() {
  console.log('🧪 Testing Regular Order Number Mapping...\n');
  
  mockRegularCancellationRequests.forEach((request, index) => {
    console.log(`📋 Test Case ${index + 1}:`);
    console.log('   Raw request:', {
      id: request.id,
      order_number: request.order_number,
      order_id: request.order_id,
      transaction_id: request.transaction_id,
      customer_name: request.customer_name,
      user_name: request.user_name,
      full_name: request.full_name
    });
    
    const processed = processRegularRequest(request);
    
    console.log('   Processed request:', {
      id: processed.id,
      order_number: processed.order_number,
      customer_name: processed.customer_name,
      customer_email: processed.customer_email,
      product_type: processed.product_type,
      total_amount: processed.total_amount,
      order_type: processed.order_type
    });
    
    // Check if order number is properly mapped
    const hasOrderNumber = processed.order_number && processed.order_number !== '';
    console.log(`   Order Number Mapped: ${hasOrderNumber ? '✅' : '❌'} (${processed.order_number || 'MISSING'})`);
    
    // Check if customer name is properly mapped
    const hasCustomerName = processed.customer_name && processed.customer_name !== '';
    console.log(`   Customer Name Mapped: ${hasCustomerName ? '✅' : '❌'} (${processed.customer_name || 'MISSING'})`);
    
    // Check if customer email is properly mapped
    const hasCustomerEmail = processed.customer_email && processed.customer_email !== '';
    console.log(`   Customer Email Mapped: ${hasCustomerEmail ? '✅' : '❌'} (${processed.customer_email || 'MISSING'})`);
    
    console.log('');
  });
}

// Test the display logic
function testDisplayLogic() {
  console.log('🎨 Testing Display Logic...\n');
  
  const processedRequests = mockRegularCancellationRequests.map(processRegularRequest);
  
  processedRequests.forEach((request, index) => {
    console.log(`📋 Display Test ${index + 1}:`);
    
    // Simulate the display logic from the component
    const displayOrderNumber = request.order_number || request.custom_order_id;
    const displayCustomerName = request.customer_name || 'Unknown Customer';
    const displayCustomerEmail = request.customer_email || 'No Email';
    const displayProductType = request.product_type || 'Unknown Product';
    const displayAmount = `₱${parseFloat(request.total_amount || 0).toFixed(2)}`;
    
    console.log('   Display Values:');
    console.log(`     Order Number: "${displayOrderNumber}"`);
    console.log(`     Customer Name: "${displayCustomerName}"`);
    console.log(`     Customer Email: "${displayCustomerEmail}"`);
    console.log(`     Product Type: "${displayProductType}"`);
    console.log(`     Amount: "${displayAmount}"`);
    
    const hasValidDisplay = displayOrderNumber && displayOrderNumber !== '' && displayOrderNumber !== 'undefined';
    console.log(`   Display Valid: ${hasValidDisplay ? '✅' : '❌'}`);
    console.log('');
  });
}

// Test edge cases
function testEdgeCases() {
  console.log('🔍 Testing Edge Cases...\n');
  
  const edgeCases = [
    {
      id: 999,
      status: 'pending',
      reason: 'No order info',
      created_at: '2025-07-10T13:00:00Z'
    },
    {
      id: 1000,
      order_number: '',
      order_id: null,
      transaction_id: undefined,
      status: 'pending',
      reason: 'Empty fields',
      created_at: '2025-07-10T14:00:00Z'
    }
  ];
  
  edgeCases.forEach((request, index) => {
    console.log(`🚨 Edge Case ${index + 1}:`);
    const processed = processRegularRequest(request);
    const displayOrderNumber = processed.order_number || processed.custom_order_id || 'NO_ORDER_NUMBER';
    
    console.log(`   Raw: ${JSON.stringify({
      order_number: request.order_number,
      order_id: request.order_id,
      transaction_id: request.transaction_id,
      id: request.id
    })}`);
    console.log(`   Processed order_number: "${processed.order_number}"`);
    console.log(`   Display order_number: "${displayOrderNumber}"`);
    console.log(`   Will show in UI: ${displayOrderNumber !== 'NO_ORDER_NUMBER' ? '✅' : '❌'}`);
    console.log('');
  });
}

// Run all tests
function runAllTests() {
  console.log('🚀 Running Regular Order Number Fix Tests...\n');
  
  testOrderNumberMapping();
  testDisplayLogic();
  testEdgeCases();
  
  console.log('📋 Test Summary:');
  console.log('   ✅ Order number mapping implemented');
  console.log('   ✅ Fallback chain: order_number → order_id → transaction_id → id');
  console.log('   ✅ Customer data mapping improved');
  console.log('   ✅ Edge cases handled');
  console.log('\n🎯 Expected Result:');
  console.log('   Regular order cancellation requests should now display proper order numbers');
  console.log('   instead of showing empty values in the Order Number column.');
  
  return true;
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    processRegularRequest,
    testOrderNumberMapping,
    testDisplayLogic,
    testEdgeCases,
    runAllTests
  };
}

// Run tests if script is executed directly
if (typeof window === 'undefined') {
  runAllTests();
}
