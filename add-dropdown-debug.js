const fs = require('fs');

try {
  const content = fs.readFileSync('client/src/pages/TransactionPage.js', 'utf8');
  
  console.log('=== Adding Debug Logging to Dropdown ===\n');

  // Add console.log to the dropdown button click handler
  const oldClickHandler = `onClick={(e) => {
                                     e.stopPropagation();
                                     const orderKey = order.custom_order_id || order.order_number || order.id;
                                     setOpenDropdown(openDropdown === orderKey ? null : orderKey);
                                   }}`;

  const newClickHandler = `onClick={(e) => {
                                     e.stopPropagation();
                                     const orderKey = order.custom_order_id || order.order_number || order.id;
                                     console.log('🔽 Dropdown clicked for order:', orderKey, 'Current open:', openDropdown);
                                     setOpenDropdown(openDropdown === orderKey ? null : orderKey);
                                   }}`;

  const updatedContent = content.replace(oldClickHandler, newClickHandler);

  // Write back to file
  fs.writeFileSync('client/src/pages/TransactionPage.js', updatedContent);
  
  console.log('✅ Added debug logging to dropdown button');
  console.log('- Click events will now log to browser console');
  console.log('- Check browser dev tools console when clicking the button');

} catch (error) {
  console.error('Error:', error.message);
}
