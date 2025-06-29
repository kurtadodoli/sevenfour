// This file will be manually copied to DeliveryPage.js
// Fix 1: Order processing logic to ensure custom orders are correctly classified

// Fix the order classification logic
if (response.data.success) {
  const ordersData = response.data.data;
  
  // Pre-process all orders to ensure custom order_type is correctly set
  ordersData.forEach(order => {
    // If any custom indicator is found, explicitly set order_type to 'custom'
    if (
      order.custom_design_id || 
      order.is_custom === true || 
      order.is_custom === 'true' ||
      (order.custom_details && Object.keys(order.custom_details).length > 0) ||
      (order.id && typeof order.id === 'string' && order.id.includes('custom-'))
    ) {
      order.order_type = 'custom';
    } else {
      order.order_type = 'regular';
    }
  });
  
  const processedOrders = ordersData.map(order => {
    return {
      ...order,
      priority: calculatePriority(order),
      customerName: order.customer_name || `${order.first_name || ''} ${order.last_name || ''}`.trim() || 'Unknown Customer'
    };
  });
  
  setOrders(processedOrders);
}
