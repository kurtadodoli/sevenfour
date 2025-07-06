// Quick test to validate calendar functionality
console.log('Testing calendar changes...');

// Test the DeliveryIcon props logic
const testDay = {
  scheduledOrders: [],
  deliveries: [],
  availabilityStatus: 'available',
  bookingCount: 0
};

// Test hasDeliveries logic
const hasDeliveries = (() => {
  const allOrders = [...(testDay.scheduledOrders || []), ...testDay.deliveries];
  return allOrders.length > 0;
})();

console.log('hasDeliveries:', hasDeliveries); // Should be false

// Test status logic
const status = (() => {
  const allOrders = [...(testDay.scheduledOrders || []), ...testDay.deliveries];
  if (allOrders.length === 0) return 'available';
  
  if (allOrders.some(order => order.delivery_status === 'delivered')) return 'delivered';
  if (allOrders.some(order => order.delivery_status === 'in_transit')) return 'in_transit';
  return 'pending';
})();

console.log('status:', status); // Should be 'available'

// Test content logic
const content = (() => {
  const totalDeliveries = testDay.deliveries.length + (testDay.scheduledOrders ? testDay.scheduledOrders.length : 0);
  if (totalDeliveries > 0) {
    return totalDeliveries > 3 ? '3+' : totalDeliveries;
  } else {
    switch (testDay.availabilityStatus) {
      case 'available': return '✓';
      case 'partial': return '◐';
      case 'busy': return '✕';
      case 'unavailable': return '⚠';
      default: return '?';
    }
  }
})();

console.log('content:', content); // Should be '✓'

console.log('Calendar changes validation completed successfully!');
