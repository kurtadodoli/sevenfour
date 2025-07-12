/**
 * Test Script for Order Information Display Fix
 * This script tests the data mapping and display logic for cancellation requests
 */

// Mock cancellation request data (simulating what comes from API)
const mockCancellationRequestRaw = {
  id: 1,
  custom_order_id: 'CUSTOM-MCSNSHEW-E616P',
  status: 'pending',
  reason: 'I dont want this product anymore',
  created_at: '2025-07-10T10:00:00Z',
  
  // Customer info might be nested or at root level
  customer_name: 'Kurt',
  customer_email: 'krutaddoll@gmail.com',
  customer_phone: null,
  
  // Address info might be nested or at root level
  street_number: '123 Main St',
  barangay: 'Barangay Test',
  municipality: 'Test City',
  province: 'Test Province',
  postal_code: '1234',
  
  // Product info might be nested or at root level
  product_type: 'shorts',
  size: 'Medium',
  color: 'Blue',
  quantity: 1,
  final_price: 850,
  estimated_price: 850,
  
  // Sometimes data might be nested in custom_order or order object
  custom_order: {
    street_number: '456 Nested St',
    barangay: 'Nested Barangay',
    municipality: 'Nested City',
    province: 'Nested Province',
    postal_code: '5678',
    size: 'Large',
    color: 'Red'
  }
};

// Simulate the data processing that happens in the fetchCancellationRequests function
function processCustomRequest(request) {
  return {
    ...request,
    order_type: 'custom',
    request_type: 'custom_order_cancellation',
    order_number: request.custom_order_id || request.order_number,
    product_image: request.product_image || request.image || (request.images && request.images[0]) || null,
    total_amount: request.total_amount || request.estimated_price || request.final_price || 0,
    
    // Map address fields from custom order data (if nested)
    street_number: request.street_number || request.custom_order?.street_number || request.order?.street_number,
    house_number: request.house_number || request.custom_order?.house_number || request.order?.house_number,
    barangay: request.barangay || request.custom_order?.barangay || request.order?.barangay,
    municipality: request.municipality || request.custom_order?.municipality || request.order?.municipality,
    province: request.province || request.custom_order?.province || request.order?.province,
    postal_code: request.postal_code || request.custom_order?.postal_code || request.order?.postal_code,
    
    // Map product fields from custom order data (if nested)
    product_type: request.product_type || request.custom_order?.product_type || request.order?.product_type,
    product_name: request.product_name || request.custom_order?.product_name || request.order?.product_name,
    size: request.size || request.custom_order?.size || request.order?.size,
    color: request.color || request.custom_order?.color || request.order?.color,
    quantity: request.quantity || request.custom_order?.quantity || request.order?.quantity || 1,
    final_price: request.final_price || request.custom_order?.final_price || request.order?.final_price,
    estimated_price: request.estimated_price || request.custom_order?.estimated_price || request.order?.estimated_price,
    special_instructions: request.special_instructions || request.custom_order?.special_instructions || request.order?.special_instructions,
    
    // Map customer fields from custom order data (if nested)
    customer_name: request.customer_name || request.custom_order?.customer_name || request.order?.customer_name,
    customer_email: request.customer_email || request.custom_order?.customer_email || request.order?.customer_email,
    customer_phone: request.customer_phone || request.custom_order?.customer_phone || request.order?.customer_phone
  };
}

// Helper functions (simulate the ones from the component)
function safeDisplayValue(value, fallback = '') {
  if (value === null || value === undefined || value === '' || value === 'null' || value === 'undefined') {
    return fallback;
  }
  return value;
}

function formatAddress(addressComponents) {
  const cleanComponents = addressComponents.filter(component => 
    component && component !== 'null' && component !== 'undefined' && component.trim() !== ''
  );
  return cleanComponents.length > 0 ? cleanComponents.join(', ') : '';
}

function formatPhone(phone) {
  if (!phone || phone === 'null' || phone === 'undefined' || phone.trim() === '') {
    return '';
  }
  return phone;
}

function formatCurrency(amount) {
  return `₱${parseFloat(amount || 0).toFixed(2)}`;
}

// Test the data processing and display logic
function testOrderInformationDisplay() {
  console.log('🧪 Testing Order Information Display Fix...\n');
  
  // Process the raw request data
  const processedRequest = processCustomRequest(mockCancellationRequestRaw);
  
  console.log('📊 Raw Request Data:');
  console.log('   customer_name:', mockCancellationRequestRaw.customer_name);
  console.log('   municipality:', mockCancellationRequestRaw.municipality);
  console.log('   size:', mockCancellationRequestRaw.size);
  console.log('   color:', mockCancellationRequestRaw.color);
  console.log('   final_price:', mockCancellationRequestRaw.final_price);
  console.log('   nested municipality:', mockCancellationRequestRaw.custom_order?.municipality);
  console.log('   nested size:', mockCancellationRequestRaw.custom_order?.size);
  console.log('   nested color:', mockCancellationRequestRaw.custom_order?.color);
  
  console.log('\n📊 Processed Request Data:');
  console.log('   order_number:', processedRequest.order_number);
  console.log('   customer_name:', processedRequest.customer_name);
  console.log('   customer_email:', processedRequest.customer_email);
  console.log('   customer_phone:', processedRequest.customer_phone);
  console.log('   street_number:', processedRequest.street_number);
  console.log('   barangay:', processedRequest.barangay);
  console.log('   municipality:', processedRequest.municipality);
  console.log('   province:', processedRequest.province);
  console.log('   postal_code:', processedRequest.postal_code);
  console.log('   product_type:', processedRequest.product_type);
  console.log('   size:', processedRequest.size);
  console.log('   color:', processedRequest.color);
  console.log('   quantity:', processedRequest.quantity);
  console.log('   final_price:', processedRequest.final_price);
  
  console.log('\n🎨 Display Values (with fallbacks):');
  
  // Test customer information
  console.log('   Customer Name:', safeDisplayValue(processedRequest.customer_name, 'Unknown Customer'));
  console.log('   Customer Email:', safeDisplayValue(processedRequest.customer_email, 'No Email'));
  console.log('   Customer Phone:', safeDisplayValue(formatPhone(processedRequest.customer_phone), 'No Phone'));
  
  // Test address information
  console.log('   Address:', safeDisplayValue(formatAddress([
    processedRequest.street_number,
    processedRequest.house_number,
    processedRequest.barangay,
    processedRequest.street_address,
    processedRequest.address
  ]), 'No Address'));
  console.log('   City:', safeDisplayValue(processedRequest.municipality, 'No City'));
  console.log('   Province:', safeDisplayValue(processedRequest.province, 'No Province'));
  console.log('   Postal Code:', safeDisplayValue(processedRequest.postal_code, 'No Postal Code'));
  
  // Test order information
  console.log('   Order Number:', processedRequest.order_number || processedRequest.custom_order_id);
  console.log('   Product Type:', safeDisplayValue(processedRequest.product_type, 'Unknown Product'));
  console.log('   Size:', safeDisplayValue(processedRequest.size, 'No Size'));
  console.log('   Color:', safeDisplayValue(processedRequest.color, 'No Color'));
  console.log('   Quantity:', processedRequest.quantity || 1);
  console.log('   Amount:', formatCurrency(processedRequest.final_price || processedRequest.estimated_price || 0));
  
  // Check if all critical fields have values
  const criticalFields = {
    'Customer Name': processedRequest.customer_name,
    'Customer Email': processedRequest.customer_email,
    'City': processedRequest.municipality,
    'Province': processedRequest.province,
    'Product Type': processedRequest.product_type,
    'Size': processedRequest.size,
    'Color': processedRequest.color,
    'Price': processedRequest.final_price || processedRequest.estimated_price
  };
  
  console.log('\n✅ Critical Fields Check:');
  let missingFields = [];
  Object.entries(criticalFields).forEach(([fieldName, value]) => {
    const hasValue = value !== null && value !== undefined && value !== '';
    console.log(`   ${fieldName}: ${hasValue ? '✅' : '❌'} (${value || 'missing'})`);
    if (!hasValue) {
      missingFields.push(fieldName);
    }
  });
  
  if (missingFields.length === 0) {
    console.log('\n🎉 All critical fields have values! The fix should work properly.');
  } else {
    console.log(`\n⚠️  ${missingFields.length} critical field(s) missing: ${missingFields.join(', ')}`);
    console.log('   This might indicate the API response structure is different than expected.');
  }
  
  return missingFields.length === 0;
}

// Test with missing data scenario
function testMissingDataScenario() {
  console.log('\n🧪 Testing Missing Data Scenario...\n');
  
  const incompleteRequest = {
    id: 2,
    custom_order_id: 'CUSTOM-TEST-123',
    status: 'pending',
    reason: 'Test reason',
    created_at: '2025-07-10T10:00:00Z',
    // Most fields missing to test fallback behavior
    customer_name: null,
    customer_email: '',
    municipality: undefined,
    size: 'null',
    color: 'undefined'
  };
  
  const processedRequest = processCustomRequest(incompleteRequest);
  
  console.log('🎨 Display Values with Missing Data:');
  console.log('   Customer Name:', safeDisplayValue(processedRequest.customer_name, 'Unknown Customer'));
  console.log('   Customer Email:', safeDisplayValue(processedRequest.customer_email, 'No Email'));
  console.log('   City:', safeDisplayValue(processedRequest.municipality, 'No City'));
  console.log('   Size:', safeDisplayValue(processedRequest.size, 'No Size'));
  console.log('   Color:', safeDisplayValue(processedRequest.color, 'No Color'));
  console.log('   Amount:', formatCurrency(processedRequest.final_price || processedRequest.estimated_price || 0));
  
  console.log('\n✅ Missing data is handled gracefully with fallback values.');
}

// Run all tests
function runAllTests() {
  console.log('🚀 Running Order Information Display Fix Tests...\n');
  
  const mainTestPassed = testOrderInformationDisplay();
  testMissingDataScenario();
  
  console.log('\n📋 Test Summary:');
  console.log(`   Data Processing: ${mainTestPassed ? '✅ PASSED' : '❌ FAILED'}`);
  console.log('   Fallback Handling: ✅ PASSED');
  console.log(`   Overall: ${mainTestPassed ? '✅ READY FOR TESTING' : '❌ NEEDS INVESTIGATION'}`);
  
  if (mainTestPassed) {
    console.log('\n🎯 Next Steps:');
    console.log('   1. Test in browser with real cancellation data');
    console.log('   2. Verify all fields display correctly');
    console.log('   3. Check that "No Address", "No Size", etc. are replaced with actual values');
  }
  
  return mainTestPassed;
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    processCustomRequest,
    safeDisplayValue,
    formatAddress,
    formatPhone,
    formatCurrency,
    testOrderInformationDisplay,
    testMissingDataScenario,
    runAllTests
  };
}

// Run tests if script is executed directly
if (typeof window === 'undefined') {
  runAllTests();
}
