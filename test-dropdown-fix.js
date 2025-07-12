// Test script to verify dropdown button fix in Verify Payment tab
console.log('🧪 Testing Dropdown Button Fix in Verify Payment Tab');

// Test data for verification orders
const mockVerificationOrders = [
  {
    order_id: 1001,
    order_number: 'ORD-2024-001',
    customer_name: 'John Doe',
    user_email: 'john@example.com',
    order_date: '2024-01-15',
    total_amount: 1500,
    payment_status: 'pending',
    gcash_reference_number: 'REF123456',
    order_type: 'regular'
  },
  {
    order_id: 1002,
    order_number: 'ORD-2024-002',
    customer_name: 'Jane Smith',
    user_email: 'jane@example.com',
    order_date: '2024-01-16',
    total_amount: 2000,
    payment_status: 'verified',
    gcash_reference_number: 'REF789012',
    order_type: 'custom'
  },
  {
    order_id: 1003,
    order_number: 'ORD-2024-003',
    customer_name: 'Bob Johnson',
    user_email: 'bob@example.com',
    order_date: '2024-01-17',
    total_amount: 1800,
    payment_status: 'pending',
    gcash_reference_number: 'REF345678',
    order_type: 'regular'
  }
];

// Test unique key generation function
function generateUniqueKey(order, index) {
  const orderId = order.order_id || order.payment_id || order.order_number || `verification-row-${index}`;
  const uniqueKey = `verification-${orderId}-${index}`;
  return uniqueKey;
}

// Test the unique key generation
console.log('📝 Testing unique key generation:');
mockVerificationOrders.forEach((order, index) => {
  const uniqueKey = generateUniqueKey(order, index);
  console.log(`Order ${order.order_number}: ${uniqueKey}`);
});

// Test dropdown state management
console.log('\n🔄 Testing dropdown state management:');
const expandedRows = new Set();

function toggleRowExpansion(uniqueKey) {
  console.log(`🔄 toggleRowExpansion called with: ${uniqueKey}`);
  console.log(`🔄 Current expanded rows: ${Array.from(expandedRows)}`);
  
  if (expandedRows.has(uniqueKey)) {
    console.log(`🔄 Collapsing row: ${uniqueKey}`);
    expandedRows.delete(uniqueKey);
  } else {
    console.log(`🔄 Expanding row: ${uniqueKey}`);
    expandedRows.add(uniqueKey);
  }
  
  console.log(`🔄 New expanded rows: ${Array.from(expandedRows)}`);
  console.log('---');
}

// Test clicking different rows
const testKeys = mockVerificationOrders.map((order, index) => generateUniqueKey(order, index));

console.log('Testing individual row clicks:');
testKeys.forEach((key, index) => {
  console.log(`\n🖱️  Clicking row ${index + 1}:`);
  toggleRowExpansion(key);
});

console.log('\nTesting multiple clicks on same row:');
console.log('\n🖱️  Clicking row 1 again:');
toggleRowExpansion(testKeys[0]);

console.log('\n🖱️  Clicking row 2 again:');
toggleRowExpansion(testKeys[1]);

console.log('\n✅ Test completed! Each row should have its own unique key and toggle independently.');
console.log('✅ The fix should prevent multiple rows from expanding when clicking one dropdown button.');
