const fs = require('fs');

try {
  const content = fs.readFileSync('client/src/pages/TransactionPage.js', 'utf8');
  
  console.log('=== Adding More Debug Info and Fixing Dropdown Logic ===\n');

  // Find the dropdown content rendering and add debugging
  const oldDropdownContent = `<DropdownContent show={openDropdown === (order.custom_order_id || order.order_number || order.id)}>
                                   {/* Show different actions based on verification stage */}
                                   {order.verification_stage === 'design_approval' ? (`;

  const newDropdownContent = `<DropdownContent show={openDropdown === (order.custom_order_id || order.order_number || order.id)}>
                                   {/* Debug info */}
                                   {console.log('🔍 Dropdown render for order:', order.custom_order_id || order.order_number, 'verification_stage:', order.verification_stage, 'payment_status:', order.payment_status, 'show:', openDropdown === (order.custom_order_id || order.order_number || order.id))}
                                   
                                   {/* Always show at least one option for debugging */}
                                   <DropdownItem
                                     className="view"
                                     onClick={(e) => {
                                       e.stopPropagation();
                                       setOpenDropdown(null);
                                       console.log('🎯 DEBUG: Order details:', order);
                                     }}
                                   >
                                     🔍 Debug Order Info
                                   </DropdownItem>
                                   
                                   {/* Show different actions based on verification stage */}
                                   {order.verification_stage === 'design_approval' ? (`;

  let updatedContent = content.replace(oldDropdownContent, newDropdownContent);

  // Also let's make sure the custom order shows the approve/reject buttons by checking for 'AWAITING PAYMENT' status
  // Let's add a condition to show approve/reject for AWAITING PAYMENT status
  const oldPaymentCondition = `) : (
                                     <>
                                       <DropdownItem
                                         className="view"
                                         onClick={(e) => {
                                           e.stopPropagation();
                                           setOpenDropdown(null);
                                           const imagePath = order.payment_proof_filename`;

  const newPaymentCondition = `) : order.verification_stage === 'payment_submitted' || order.payment_status === 'pending' || (order.order_type === 'custom' && !order.payment_status) ? (
                                     <>
                                       <DropdownItem
                                         className="view"
                                         onClick={(e) => {
                                           e.stopPropagation();
                                           setOpenDropdown(null);
                                           console.log('👁️ Viewing payment proof for:', order.custom_order_id);
                                           const imagePath = order.payment_proof_filename`;

  updatedContent = updatedContent.replace(oldPaymentCondition, newPaymentCondition);

  // Write back to file
  fs.writeFileSync('client/src/pages/TransactionPage.js', updatedContent);
  
  console.log('✅ Added debugging and improved dropdown conditions');
  console.log('- Added debug dropdown item to show order details');
  console.log('- Added console logging for dropdown render');
  console.log('- Improved condition for showing payment verification buttons');
  console.log('- Will show approve/reject for custom orders without payment status');

} catch (error) {
  console.error('Error:', error.message);
}
