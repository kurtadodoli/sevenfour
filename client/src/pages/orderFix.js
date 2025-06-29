// This is the order classification logic fix
const fixOrderClassification = (ordersData) => {
  // Deep clone to avoid mutating the original data
  const processedOrders = JSON.parse(JSON.stringify(ordersData));
  
  // Process each order to set the correct order_type
  return processedOrders.map(order => {
    // Determine if this is a custom order based on multiple indicators
    const isCustomOrder = Boolean(
      order.custom_design_id || 
      order.is_custom === true || 
      order.is_custom === 'true' ||
      (order.custom_details && Object.keys(order.custom_details).length > 0) ||
      (order.id && typeof order.id === 'string' && order.id.includes('custom-'))
    );
    
    // Set the order_type explicitly
    const orderType = isCustomOrder ? 'custom' : 'regular';
    
    return {
      ...order,
      order_type: orderType,
      priority: calculatePriority(order),
      customerName: order.customer_name || 
                    `${order.first_name || ''} ${order.last_name || ''}`.trim() || 
                    'Unknown Customer'
    };
  });
};

// This is the filter function logic fix
const filterOrdersByType = (orders, orderFilter) => {
  if (orderFilter === 'all') return orders;
  
  return orders.filter(order => {
    if (orderFilter === 'regular') {
      return order.order_type === 'regular';
    } else if (orderFilter === 'custom') {
      return order.order_type === 'custom';
    }
    return true;
  });
};
