const fs = require('fs');
const path = require('path');

// Add payment verification buttons to custom design requests ActionsContainer
const filePath = path.join(__dirname, 'client', 'src', 'pages', 'TransactionPage.js');

console.log('🔧 Adding payment verification buttons to custom design requests ActionsContainer...');

try {
    // Read the file
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Find the exact location to insert payment verification buttons
    const searchPattern = `                               )}
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

    const replacement = `                               )}
                               
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
        content = content.replace(searchPattern, replacement);
        console.log('✅ Successfully added payment verification buttons to custom design requests!');
        
        // Check if verifyCustomOrderPayment function exists, if not add it
        const functionExists = content.includes('const verifyCustomOrderPayment = async');
        
        if (!functionExists) {
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
        } else {
            console.log('ℹ️ verifyCustomOrderPayment function already exists');
        }
        
        // Write the updated content back
        fs.writeFileSync(filePath, content, 'utf8');
        
        console.log('\n🎉 Payment verification functionality added successfully!');
        console.log('Custom orders with status "approved" and submitted payment proof will now show:');
        console.log('- View Payment Proof button');
        console.log('- Approve Payment button'); 
        console.log('- Reject Payment button');
        console.log('\nRestart your React dev server to see the changes.');
        
    } else {
        console.log('❌ Could not find the exact pattern to replace.');
        console.log('Let me try to find the current ActionsContainer structure...');
        
        // Find the current structure around line 3885
        const lines = content.split('\n');
        for (let i = 3880; i < 3900; i++) {
            if (lines[i] && lines[i].includes('ActionButton')) {
                console.log(`Line ${i + 1}: ${lines[i].trim()}`);
            }
        }
    }
    
} catch (error) {
    console.error('❌ Error adding payment verification buttons:', error.message);
}
