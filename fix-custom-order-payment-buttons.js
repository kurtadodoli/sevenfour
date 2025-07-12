const fs = require('fs');

try {
  const content = fs.readFileSync('client/src/pages/TransactionPage.js', 'utf8');
  
  console.log('=== Fixing Custom Order Payment Verification Buttons ===\n');

  // Fix line 3723: Change from verifyPayment to verifyCustomOrderPayment for approve
  let updatedContent = content.replace(
    /verifyPayment\(order\.id \|\| order\.order_id, 'verified'\)/g,
    "verifyCustomOrderPayment(order.custom_order_id, 'verified')"
  );

  // Fix line 3733: Change from verifyPayment to verifyCustomOrderPayment for reject
  updatedContent = updatedContent.replace(
    /verifyPayment\(order\.id \|\| order\.order_id, 'rejected'\)/g,
    "verifyCustomOrderPayment(order.custom_order_id, 'rejected')"
  );

  // Write the updated content back to the file
  fs.writeFileSync('client/src/pages/TransactionPage.js', updatedContent);
  
  console.log('✅ Fixed payment verification buttons for custom orders');
  console.log('- Changed verifyPayment calls to verifyCustomOrderPayment');
  console.log('- Updated to use order.custom_order_id instead of order.id');

} catch (error) {
  console.error('Error:', error.message);
}
