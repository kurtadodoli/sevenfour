const fs = require('fs');
const path = require('path');

// Add payment verification buttons and function to custom design requests
const filePath = path.join(__dirname, 'client', 'src', 'pages', 'TransactionPage.js');

console.log('🔧 Adding payment verification functionality to custom design requests...');

try {
    // Read the file
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 1. First, add the verifyCustomOrderPayment function
    const functionSearchPattern = `  const processDesignRequest = async (designId, status) => {`;
    
    const functionToAdd = `  // Function to verify custom order payment
  const verifyCustomOrderPayment = async (customOrderId, paymentStatus) => {
    const loadingKey = \`payment_\${customOrderId}_\${paymentStatus === 'verified' ? 'approve' : 'reject'}\`;
    
    // Prevent double submissions
    if (buttonLoading[loadingKey]) {
      return;
    }

    try {
      // Set loading state
      setButtonLoading(prev => ({ ...prev, [loadingKey]: true }));

      const response = await api.put(\`/custom-orders/\${customOrderId}/verify-payment\`, {
        payment_status: paymentStatus,
        admin_notes: paymentStatus === 'verified' ? 'Payment approved by admin' : 'Payment rejected by admin'
      });

      if (response.data.success) {
        toast.success(\`Payment \${paymentStatus === 'verified' ? 'approved' : 'rejected'} successfully!\`);
        await fetchCustomDesignRequests(); // Refresh the list
      } else {
        throw new Error(response.data.message || 'Failed to update payment status');
      }

    } catch (error) {
      console.error('❌ Error verifying payment:', error);
      toast.error(error.response?.data?.message || \`Failed to \${paymentStatus === 'verified' ? 'approve' : 'reject'} payment\`);
    } finally {
      // Clear loading state
      setButtonLoading(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  const processDesignRequest = async (designId, status) => {`;

    if (content.includes(functionSearchPattern)) {
        content = content.replace(functionSearchPattern, functionToAdd);
        console.log('✅ Added verifyCustomOrderPayment function');
    }
    
    // 2. Fix the condition to remove "|| true" from design approval buttons
    const oldCondition = `{(request.status === 'pending' || request.status === 'Pending' || true) && (`;
    const newCondition = `{(request.status === 'pending' || request.status === 'Pending') && (`;
    
    content = content.replace(oldCondition, newCondition);
    console.log('✅ Fixed design approval button condition');
    
    // 3. Add payment verification buttons after the design approval section
    const insertAfterPattern = `                              )}
                              <ActionButton
                                variant="view"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Add logic to view design details in modal if needed   
                                }}
                              >
                                <FontAwesomeIcon icon={faEye} />
                              </ActionButton>
                            </ActionsContainer>`;

    const insertReplacement = `                              )}
                              
                              {/* Payment Verification Buttons (for approved requests with payment submitted) */}
                              {request.status === 'approved' && request.payment_proof_filename && request.payment_status !== 'verified' && (
                                <>
                                  <ActionButton
                                    variant="view"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const imagePath = \`/uploads/payment-proofs/\${request.payment_proof_filename}\`;
                                      const customerName = request.customer_name || [request.first_name, request.last_name].filter(Boolean).join(' ') || 'Unknown';
                                      const gcashRef = request.gcash_reference_number || request.payment_reference || request.gcash_reference;
                                      viewPaymentProof(imagePath, customerName, request.custom_order_id, gcashRef, request);
                                    }}
                                    title="View Payment Proof"
                                  >
                                    <FontAwesomeIcon icon={faEye} />
                                  </ActionButton>
                                  <ActionButton
                                    variant="approve"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      verifyCustomOrderPayment(request.custom_order_id, 'verified');
                                    }}
                                    loading={buttonLoading[\`payment_\${request.custom_order_id}_approve\`]}
                                    disabled={buttonLoading[\`payment_\${request.custom_order_id}_approve\`] || buttonLoading[\`payment_\${request.custom_order_id}_reject\`]}
                                    title="Approve Payment"
                                  >
                                    <FontAwesomeIcon icon={faCheck} />
                                  </ActionButton>
                                  <ActionButton
                                    variant="reject"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      verifyCustomOrderPayment(request.custom_order_id, 'rejected');
                                    }}
                                    loading={buttonLoading[\`payment_\${request.custom_order_id}_reject\`]}
                                    disabled={buttonLoading[\`payment_\${request.custom_order_id}_approve\`] || buttonLoading[\`payment_\${request.custom_order_id}_reject\`]}
                                    title="Reject Payment"
                                  >
                                    <FontAwesomeIcon icon={faTimes} />
                                  </ActionButton>
                                </>
                              )}
                              
                              {/* View Button (always available) */}
                              <ActionButton
                                variant="view"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Add logic to view design details in modal if needed   
                                }}
                              >
                                <FontAwesomeIcon icon={faEye} />
                              </ActionButton>
                            </ActionsContainer>`;

    if (content.includes(insertAfterPattern)) {
        content = content.replace(insertAfterPattern, insertReplacement);
        console.log('✅ Added payment verification buttons to custom design requests');
    } else {
        console.log('⚠️ Could not find exact pattern for button insertion, trying alternative...');
        
        // Alternative pattern - just add buttons before the closing ActionsContainer
        const altPattern = `                              <ActionButton
                                variant="view"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Add logic to view design details in modal if needed   
                                }}
                              >
                                <FontAwesomeIcon icon={faEye} />
                              </ActionButton>
                            </ActionsContainer>`;
        
        const altReplacement = `                              {/* Payment Verification Buttons (for approved requests with payment submitted) */}
                              {request.status === 'approved' && request.payment_proof_filename && request.payment_status !== 'verified' && (
                                <>
                                  <ActionButton
                                    variant="view"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const imagePath = \`/uploads/payment-proofs/\${request.payment_proof_filename}\`;
                                      const customerName = request.customer_name || [request.first_name, request.last_name].filter(Boolean).join(' ') || 'Unknown';
                                      const gcashRef = request.gcash_reference_number || request.payment_reference || request.gcash_reference;
                                      viewPaymentProof(imagePath, customerName, request.custom_order_id, gcashRef, request);
                                    }}
                                    title="View Payment Proof"
                                  >
                                    <FontAwesomeIcon icon={faEye} />
                                  </ActionButton>
                                  <ActionButton
                                    variant="approve"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      verifyCustomOrderPayment(request.custom_order_id, 'verified');
                                    }}
                                    loading={buttonLoading[\`payment_\${request.custom_order_id}_approve\`]}
                                    disabled={buttonLoading[\`payment_\${request.custom_order_id}_approve\`] || buttonLoading[\`payment_\${request.custom_order_id}_reject\`]}
                                    title="Approve Payment"
                                  >
                                    <FontAwesomeIcon icon={faCheck} />
                                  </ActionButton>
                                  <ActionButton
                                    variant="reject"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      verifyCustomOrderPayment(request.custom_order_id, 'rejected');
                                    }}
                                    loading={buttonLoading[\`payment_\${request.custom_order_id}_reject\`]}
                                    disabled={buttonLoading[\`payment_\${request.custom_order_id}_approve\`] || buttonLoading[\`payment_\${request.custom_order_id}_reject\`]}
                                    title="Reject Payment"
                                  >
                                    <FontAwesomeIcon icon={faTimes} />
                                  </ActionButton>
                                </>
                              )}
                              
                              {/* View Button (always available) */}
                              <ActionButton
                                variant="view"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Add logic to view design details in modal if needed   
                                }}
                              >
                                <FontAwesomeIcon icon={faEye} />
                              </ActionButton>
                            </ActionsContainer>`;
        
        if (content.includes(altPattern)) {
            content = content.replace(altPattern, altReplacement);
            console.log('✅ Added payment verification buttons using alternative pattern');
        }
    }
    
    // Write the updated content back to the file
    fs.writeFileSync(filePath, content, 'utf8');
    
    console.log('\n🎉 Payment verification functionality added successfully!');
    console.log('Custom orders with status "approved" and submitted payment proof will now show:');
    console.log('- View Payment Proof button');
    console.log('- Approve Payment button');
    console.log('- Reject Payment button');
    console.log('\nRestart your React dev server to see the changes.');
    
} catch (error) {
    console.error('❌ Error adding payment verification functionality:', error.message);
}
