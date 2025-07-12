const fs = require('fs');
const path = require('path');

// Add payment verification buttons to custom design requests
const filePath = path.join(__dirname, 'client', 'src', 'pages', 'TransactionPage.js');

console.log('🔧 Adding payment verification buttons to custom design requests...');

try {
    // Read the file
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Find the ActionsContainer for custom design requests and replace it
    const searchPattern = `                             <ActionsContainer>
                               {(request.status === 'pending' || request.status === 'Pending' || true) && (
                                 <>
                                   <ActionButton
                                     variant="approve"
                                     onClick={(e) => {
                                       e.stopPropagation();
                                       processDesignRequest(request.custom_order_id, 'approved');
                                     }}
                                     loading={buttonLoading[\`design_\${request.custom_order_id}_approve\`]}
                                     disabled={buttonLoading[\`design_\${request.custom_order_id}_approve\`] || buttonLoading[\`design_\${request.custom_order_id}_reject\`]}
                                     title="Approve Design Request"
                                   >
                                     <FontAwesomeIcon icon={faCheck} />
                                   </ActionButton>
                                   <ActionButton
                                     variant="reject"
                                     onClick={(e) => {
                                       e.stopPropagation();
                                       processDesignRequest(request.custom_order_id, 'rejected');
                                     }}
                                     loading={buttonLoading[\`design_\${request.custom_order_id}_reject\`]}
                                     disabled={buttonLoading[\`design_\${request.custom_order_id}_approve\`] || buttonLoading[\`design_\${request.custom_order_id}_reject\`]}
                                     title="Reject Design Request"
                                   >
                                     <FontAwesomeIcon icon={faTimes} />
                                   </ActionButton>
                                 </>
                               )}
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

    const replacement = `                             <ActionsContainer>
                               {/* Design Request Approval Buttons (for pending requests) */}
                               {(request.status === 'pending' || request.status === 'Pending') && (
                                 <>
                                   <ActionButton
                                     variant="approve"
                                     onClick={(e) => {
                                       e.stopPropagation();
                                       processDesignRequest(request.custom_order_id, 'approved');
                                     }}
                                     loading={buttonLoading[\`design_\${request.custom_order_id}_approve\`]}
                                     disabled={buttonLoading[\`design_\${request.custom_order_id}_approve\`] || buttonLoading[\`design_\${request.custom_order_id}_reject\`]}
                                     title="Approve Design Request"
                                   >
                                     <FontAwesomeIcon icon={faCheck} />
                                   </ActionButton>
                                   <ActionButton
                                     variant="reject"
                                     onClick={(e) => {
                                       e.stopPropagation();
                                       processDesignRequest(request.custom_order_id, 'rejected');
                                     }}
                                     loading={buttonLoading[\`design_\${request.custom_order_id}_reject\`]}
                                     disabled={buttonLoading[\`design_\${request.custom_order_id}_approve\`] || buttonLoading[\`design_\${request.custom_order_id}_reject\`]}
                                     title="Reject Design Request"
                                   >
                                     <FontAwesomeIcon icon={faTimes} />
                                   </ActionButton>
                                 </>
                               )}
                               
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

    if (content.includes(searchPattern)) {
        const updatedContent = content.replace(searchPattern, replacement);
        fs.writeFileSync(filePath, updatedContent, 'utf8');
        
        console.log('✅ Successfully added payment verification buttons to custom design requests!');
        console.log('Now I need to add the verifyCustomOrderPayment function...');
        
        // Now add the verifyCustomOrderPayment function
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

        const updatedContent2 = updatedContent.replace(functionSearchPattern, functionToAdd);
        fs.writeFileSync(filePath, updatedContent2, 'utf8');
        
        console.log('✅ Successfully added verifyCustomOrderPayment function!');
        console.log('Payment verification buttons are now ready for custom orders.');
        
    } else {
        console.log('❌ Could not find the exact pattern to replace.');
        console.log('The ActionsContainer structure may have changed.');
    }
    
} catch (error) {
    console.error('❌ Error adding payment verification buttons:', error.message);
}
