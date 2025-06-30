// Test script to validate the isScheduled logic change
console.log('Testing isScheduled logic for custom orders...');

// Mock data that simulates the orders from the API
const orders = [
  {
    id: 47,
    order_number: 'CUSTOM-8H-QMZ5R-2498',
    order_type: 'custom_order',
    delivery_status: null,  // No delivery schedule yet
    customerName: 'Test Customer'
  },
  {
    id: 44,
    order_number: 'CUSTOM-DF-Q5SVA-1544',
    order_type: 'custom_order',
    delivery_status: null,  // No delivery schedule yet
    customerName: 'Another Customer'
  },
  {
    id: 42,
    order_number: 'ORD12345',
    order_type: 'regular',
    delivery_status: 'scheduled',
    customerName: 'Regular Customer'
  }
];

// Mock production start dates state (simulates what happens when user sets production start)
const customOrderProductionStartDates = {
  47: '2025-07-15'  // Order 47 has production start set
  // Order 44 doesn't have production start set yet
};

// Test the OLD logic (before fix)
console.log('\n=== OLD LOGIC (before fix) ===');
orders.forEach(order => {
  const isScheduledOld = order.delivery_status && order.delivery_status !== 'pending';
  console.log(`Order ${order.order_number} (${order.order_type}): isScheduled = ${isScheduledOld} (delivery_status: ${order.delivery_status})`);
});

// Test the NEW logic (after fix)
console.log('\n=== NEW LOGIC (after fix) ===');
orders.forEach(order => {
  const hasProductionTimeline = (order.order_type === 'custom' || order.order_type === 'custom_order') && customOrderProductionStartDates[order.id];
  const isScheduledNew = hasProductionTimeline || (order.delivery_status && order.delivery_status !== 'pending');
  console.log(`Order ${order.order_number} (${order.order_type}): isScheduled = ${isScheduledNew} (hasProductionTimeline: ${hasProductionTimeline}, delivery_status: ${order.delivery_status})`);
});

console.log('\n=== EXPECTED BEHAVIOR ===');
console.log('✅ Order CUSTOM-8H-QMZ5R-2498 should show status management buttons (has production timeline)');
console.log('❌ Order CUSTOM-DF-Q5SVA-1544 should show "Set Production Start" button (no production timeline yet)');
console.log('✅ Order ORD12345 should show status management buttons (regular order with delivery_status)');
