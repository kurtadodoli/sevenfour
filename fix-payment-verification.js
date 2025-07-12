const fs = require('fs');
const path = require('path');

// Add payment verification buttons to custom design requests
const filePath = path.join(__dirname, 'client', 'src', 'pages', 'TransactionPage.js');

console.log('🔧 Adding payment verification buttons to custom design requests...');

try {
    // Read the file
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Find the current ActionsContainer and replace it with enhanced version
    const searchPattern = `                             <ActionsContainer>
                               {(request.status === 'pending' || request.status === 'Pending' || true) && (`;

    const replacement = `                             <ActionsContainer>
                               {/* Design Request Approval Buttons (for pending requests) */}
                               {(request.status === 'pending' || request.status === 'Pending') && (`;

    if (content.includes(searchPattern)) {
        // First, fix the condition for design approval buttons
        let updatedContent = content.replace(searchPattern, replacement);
        
        // Now add payment verification buttons after the design approval section
        const insertPattern = `                               )}
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

        const insertReplacement = `                               )}
                               
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

        updatedContent = updatedContent.replace(insertPattern, insertReplacement);
        
        // Add the verifyCustomOrderPayment function
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

        if (updatedContent.includes(functionSearchPattern)) {
            updatedContent = updatedContent.replace(functionSearchPattern, functionToAdd);
            console.log('✅ Added verifyCustomOrderPayment function');
        }
        
        fs.writeFileSync(filePath, updatedContent, 'utf8');
        
        console.log('✅ Successfully added payment verification buttons to custom design requests!');
        console.log('The buttons will show for approved custom orders with submitted payment proof.');
        
    } else {
        console.log('❌ Could not find the search pattern. Let me show what was found...');
        console.log('Looking for pattern starting with: "ActionsContainer>"');
        
        // Show lines containing ActionsContainer for debugging
        const lines = content.split('\n');
        lines.forEach((line, index) => {
            if (line.includes('ActionsContainer>')) {
                console.log(`Line ${index + 1}: ${line.trim()}`);
            }
        });
    }
    
} catch (error) {
    console.error('❌ Error adding payment verification buttons:', error.message);
}
