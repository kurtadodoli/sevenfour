const fs = require('fs');

try {
  const content = fs.readFileSync('client/src/pages/TransactionPage.js', 'utf8');
  
  console.log('=== Replacing ActionsContainer with Dropdown Menu ===\n');

  // Find the current ActionsContainer section that starts around line 3672
  const actionsStart = content.indexOf('<ActionsContainer className="stacked" onClick={(e) => e.stopPropagation()}>');
  const actionsEnd = content.indexOf('</ActionsContainer>', actionsStart) + '</ActionsContainer>'.length;
  
  if (actionsStart === -1 || actionsEnd === -1) {
    throw new Error('Could not find ActionsContainer to replace');
  }

  // Create the new dropdown menu
  const newDropdownMenu = `<div style={{ textAlign: 'center' }}>
                              <DropdownMenu className="dropdown-menu">
                                <DropdownButton
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const orderKey = order.custom_order_id || order.order_number || order.id;
                                    setOpenDropdown(openDropdown === orderKey ? null : orderKey);
                                  }}
                                  title="Actions"
                                >
                                  ⋮
                                </DropdownButton>
                                <DropdownContent show={openDropdown === (order.custom_order_id || order.order_number || order.id)}>
                                  {/* Show different actions based on verification stage */}
                                  {order.verification_stage === 'design_approval' ? (
                                    <>
                                      <DropdownItem
                                        className="view"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setOpenDropdown(null);
                                          // Switch to design requests tab to approve this order
                                          setActiveTab('design-requests');
                                        }}
                                      >
                                        📋 Go to Design Approval
                                      </DropdownItem>
                                    </>
                                  ) : order.verification_stage === 'awaiting_payment' ? (
                                    <>
                                      <DropdownItem
                                        className="view"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setOpenDropdown(null);
                                          alert('Customer needs to submit payment proof for this approved design');
                                        }}
                                      >
                                        ⏳ Awaiting Customer Payment
                                      </DropdownItem>
                                    </>
                                  ) : (
                                    <>
                                      <DropdownItem
                                        className="view"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setOpenDropdown(null);
                                          const imagePath = order.payment_proof_filename 
                                            ? \`/uploads/payment-proofs/\${order.payment_proof_filename}\`
                                            : order.payment_proof_image_path;
                                          const gcashRef = order.gcash_reference_number || order.payment_reference || order.gcash_reference;
                                          const customerName = order.customer_name || order.customer_fullname || \`\${order.first_name} \${order.last_name}\`;
                                          viewPaymentProof(imagePath, customerName, order.order_number, gcashRef, order);
                                        }}
                                      >
                                        👁️ View Payment Proof
                                      </DropdownItem>
                                      <DropdownItem
                                        className="approve"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setOpenDropdown(null);
                                          verifyCustomOrderPayment(order.custom_order_id, 'verified');
                                        }}
                                        disabled={buttonLoading[\`payment_\${order.custom_order_id}_approve\`] || buttonLoading[\`payment_\${order.custom_order_id}_reject\`]}
                                      >
                                        {buttonLoading[\`payment_\${order.custom_order_id}_approve\`] ? '⏳ Approving...' : '✅ Approve Payment'}
                                      </DropdownItem>
                                      <DropdownItem
                                        className="reject"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setOpenDropdown(null);
                                          verifyCustomOrderPayment(order.custom_order_id, 'rejected');
                                        }}
                                        disabled={buttonLoading[\`payment_\${order.custom_order_id}_approve\`] || buttonLoading[\`payment_\${order.custom_order_id}_reject\`]}
                                      >
                                        {buttonLoading[\`payment_\${order.custom_order_id}_reject\`] ? '⏳ Rejecting...' : '❌ Reject Payment'}
                                      </DropdownItem>
                                    </>
                                  )}
                                </DropdownContent>
                              </DropdownMenu>
                            </div>`;

  // Replace the old ActionsContainer with the new dropdown
  const updatedContent = content.slice(0, actionsStart) + newDropdownMenu + content.slice(actionsEnd);

  // Write back to file
  fs.writeFileSync('client/src/pages/TransactionPage.js', updatedContent);
  
  console.log('✅ Replaced ActionsContainer with dropdown menu');
  console.log('- Three-dots button (⋮) for actions');
  console.log('- Conditional menu items based on verification stage');
  console.log('- Approve/Deny buttons for payment verification');
  console.log('- Loading states with visual feedback');
  console.log('- Proper event handling and state management');

} catch (error) {
  console.error('Error:', error.message);
}
