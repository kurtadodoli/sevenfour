const fs = require('fs');

try {
  const content = fs.readFileSync('client/src/pages/TransactionPage.js', 'utf8');
  
  console.log('=== Adding Loading States to Custom Order Payment Buttons ===\n');

  // Add loading and disabled props to the Approve Payment button
  let updatedContent = content.replace(
    /<ActionButton\s+variant="approve"\s+onClick=\{\(e\) => \{\s+e\.stopPropagation\(\);\s+verifyCustomOrderPayment\(order\.custom_order_id, 'verified'\);\s+\}\}\s+title="Approve Payment"\s+>/,
    `<ActionButton
                                       variant="approve"
                                       onClick={(e) => {
                                         e.stopPropagation();
                                         verifyCustomOrderPayment(order.custom_order_id, 'verified');
                                       }}
                                       loading={buttonLoading[\`payment_\${order.custom_order_id}_approve\`]}
                                       disabled={buttonLoading[\`payment_\${order.custom_order_id}_approve\`] || buttonLoading[\`payment_\${order.custom_order_id}_reject\`]}
                                       title="Approve Payment"
                                     >`
  );

  // Add loading and disabled props to the Reject Payment button
  updatedContent = updatedContent.replace(
    /<ActionButton\s+variant="reject"\s+onClick=\{\(e\) => \{\s+e\.stopPropagation\(\);\s+verifyCustomOrderPayment\(order\.custom_order_id, 'rejected'\);\s+\}\}\s+title="Reject Payment"\s+>/,
    `<ActionButton
                                       variant="reject"
                                       onClick={(e) => {
                                         e.stopPropagation();
                                         verifyCustomOrderPayment(order.custom_order_id, 'rejected');
                                       }}
                                       loading={buttonLoading[\`payment_\${order.custom_order_id}_reject\`]}
                                       disabled={buttonLoading[\`payment_\${order.custom_order_id}_approve\`] || buttonLoading[\`payment_\${order.custom_order_id}_reject\`]}
                                       title="Reject Payment"
                                     >`
  );

  // Write the updated content back to the file
  fs.writeFileSync('client/src/pages/TransactionPage.js', updatedContent);
  
  console.log('✅ Added loading states to custom order payment verification buttons');
  console.log('- Approve button: loading={buttonLoading[`payment_${order.custom_order_id}_approve`]}');
  console.log('- Reject button: loading={buttonLoading[`payment_${order.custom_order_id}_reject`]}');
  console.log('- Both buttons disabled when either is loading');

} catch (error) {
  console.error('Error:', error.message);
}
