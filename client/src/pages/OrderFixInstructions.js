// ===== COPY THIS CODE INTO YOUR DELIVERY PAGE.JS =====

// FOR THE ORDER PROCESSING SECTION:
// Find this section in the fetchData function and replace the order processing logic with this code:

const ordersResponse = await api.get('/delivery-enhanced/orders');
if (ordersResponse.data.success) {
  const ordersData = ordersResponse.data.data;

  // Map orders with accurate type classification
  const processedOrders = ordersData.map(order => {
    // Make a copy of the order to avoid mutation issues
    const processedOrder = {...order};
    
    // CRITICAL FIX: Check for ANY sign this might be a custom order and set type accordingly
    if (
      processedOrder.custom_design_id || 
      processedOrder.is_custom === true || 
      processedOrder.is_custom === 'true' ||
      (processedOrder.custom_details && Object.keys(processedOrder.custom_details).length > 0) ||
      (processedOrder.id && typeof processedOrder.id === 'string' && processedOrder.id.includes('custom-'))
    ) {
      // Force it to have the custom order_type
      processedOrder.order_type = 'custom';
    } else {
      // If no custom indicators are found, mark as regular
      processedOrder.order_type = 'regular';
    }
    
    return {
      ...processedOrder,
      priority: calculatePriority(processedOrder),
      customerName: processedOrder.customer_name || 
                    `${processedOrder.first_name || ''} ${processedOrder.last_name || ''}`.trim() || 
                    'Unknown Customer'
    };
  });
  
  // Log for debugging - can be removed later
  console.log('===== ORDER TYPE CLASSIFICATION =====');
  processedOrders.forEach(order => {
    console.log(`Order ID: ${order.id}, Type: ${order.order_type}`);
  });
  
  setOrders(processedOrders);
}

// ===== FOR THE FILTER FUNCTION =====
// Find the part where orders are filtered by type and replace with this code:

const filteredOrders = orders
  .filter(order => {
    // Enhanced filtering logic with strict type checking
    if (orderFilter === 'all') return true;
    
    // Regular orders - ONLY include orders explicitly marked as regular
    if (orderFilter === 'regular') {
      return order.order_type === 'regular';
    }
    
    // Custom orders - ONLY include orders explicitly marked as custom
    if (orderFilter === 'custom') {
      return order.order_type === 'custom';
    }
    
    return true;
  })
  .filter(order => {
    // Filter by search query
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    
    // Search in multiple fields
    return (
      (order.order_number && order.order_number.toString().includes(query)) ||
      (order.id && order.id.toString().includes(query)) ||
      (order.customerName && order.customerName.toLowerCase().includes(query)) ||
      (order.shipping_address && order.shipping_address.toLowerCase().includes(query)) ||
      (order.delivery_status && order.delivery_status.toLowerCase().includes(query)) ||
      (order.order_type && order.order_type.toLowerCase().includes(query))
    );
  });
