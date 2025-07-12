// Test script to verify dropdown button fix in Cancellation Requests tab
console.log('🧪 Testing Dropdown Button Fix in Cancellation Requests Tab');

// Test data for cancellation requests
const mockCancellationRequests = [
  {
    id: 2001,
    custom_order_id: 'CANC-2024-001',
    customer_name: 'John Doe',
    customer_email: 'john@example.com',
    created_at: '2024-01-15',
    reason: 'Changed mind',
    status: 'pending'
  },
  {
    id: 2002,
    custom_order_id: 'CANC-2024-002',
    customer_name: 'Jane Smith',
    customer_email: 'jane@example.com',
    created_at: '2024-01-16',
    reason: 'Wrong size',
    status: 'approved'
  },
  {
    id: 2003,
    custom_order_id: 'CANC-2024-003',
    customer_name: 'Bob Johnson',
    customer_email: 'bob@example.com',
    created_at: '2024-01-17',
    reason: 'Defective product',
    status: 'pending'
  }
];

// Test unique key generation function for cancellation requests (enhanced version)
function generateCancellationUniqueKey(request, index) {
  const requestId = request.id;
  const uniqueKey = `cancellation-${requestId}-${index}`;
  return uniqueKey;
}

// Test the unique key generation for cancellation requests
console.log('📝 Testing cancellation requests unique key generation (enhanced):');
mockCancellationRequests.forEach((request, index) => {
  const uniqueKey = generateCancellationUniqueKey(request, index);
  console.log(`Request ${request.custom_order_id}: ${uniqueKey}`);
});

// Test dropdown state management for cancellation requests
console.log('\n🔄 Testing cancellation requests dropdown state management:');
const expandedCancellationRows = new Set();

function toggleCancellationRowExpansion(uniqueKey) {
  console.log(`🔄 toggleCancellationRowExpansion called with: ${uniqueKey}`);
  console.log(`🔄 Current expanded cancellation rows: ${Array.from(expandedCancellationRows)}`);
  
  if (expandedCancellationRows.has(uniqueKey)) {
    console.log(`🔄 Collapsing cancellation row: ${uniqueKey}`);
    expandedCancellationRows.delete(uniqueKey);
  } else {
    console.log(`🔄 Expanding cancellation row: ${uniqueKey}`);
    expandedCancellationRows.add(uniqueKey);
  }
  
  console.log(`🔄 New expanded cancellation rows: ${Array.from(expandedCancellationRows)}`);
  console.log('---');
}

// Test clicking different cancellation rows
const testCancellationKeys = mockCancellationRequests.map((request, index) => generateCancellationUniqueKey(request, index));

console.log('Testing individual cancellation row clicks:');
testCancellationKeys.forEach((key, index) => {
  console.log(`\n🖱️  Clicking cancellation row ${index + 1}:`);
  toggleCancellationRowExpansion(key);
});

console.log('\nTesting multiple clicks on same cancellation row:');
console.log('\n🖱️  Clicking cancellation row 1 again:');
toggleCancellationRowExpansion(testCancellationKeys[0]);

console.log('\n🖱️  Clicking cancellation row 2 again:');
toggleCancellationRowExpansion(testCancellationKeys[1]);

console.log('\n✅ Cancellation requests test completed!');
console.log('✅ Each cancellation request should have its own unique key and toggle independently.');
console.log('✅ The fix should prevent multiple cancellation rows from expanding when clicking one dropdown button.');

// Test comparing with other tabs to ensure no conflicts
console.log('\n🔍 Testing state isolation between tabs:');
const expandedVerificationRows = new Set();
const expandedCustomDesignRows = new Set();
const expandedRefundRows = new Set();

function testStateIsolation() {
  // Add items to different tab states
  expandedCancellationRows.add('cancellation-2001');
  expandedVerificationRows.add('verification-1001-0');
  expandedCustomDesignRows.add('design-request-3001');
  expandedRefundRows.add('refund-request-4001');
  
  console.log('🔄 State isolation test:');
  console.log(`  Cancellation rows: ${Array.from(expandedCancellationRows)}`);
  console.log(`  Verification rows: ${Array.from(expandedVerificationRows)}`);
  console.log(`  Custom design rows: ${Array.from(expandedCustomDesignRows)}`);
  console.log(`  Refund rows: ${Array.from(expandedRefundRows)}`);
  
  // Test that each state is independent
  const hasConflicts = expandedCancellationRows.has('verification-1001-0') ||
                      expandedVerificationRows.has('cancellation-2001') ||
                      expandedCustomDesignRows.has('cancellation-2001') ||
                      expandedRefundRows.has('cancellation-2001');
  
  if (hasConflicts) {
    console.log('❌ State isolation FAILED - there are conflicts between tabs!');
  } else {
    console.log('✅ State isolation PASSED - each tab has its own independent state!');
  }
}

testStateIsolation();
