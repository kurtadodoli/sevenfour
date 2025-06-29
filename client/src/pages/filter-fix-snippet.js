// Fix 2: Order filtering logic
// Replace the filtering code with strict type checks

if (orderFilter === 'regular') {
  return order.order_type === 'regular';
}

if (orderFilter === 'custom') {
  return order.order_type === 'custom';
}
