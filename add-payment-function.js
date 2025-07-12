const fs = require('fs');
const path = require('path');

// Add verifyCustomOrderPayment function to TransactionPage.js
const filePath = path.join(__dirname, 'client', 'src', 'pages', 'TransactionPage.js');

console.log('🔧 Adding verifyCustomOrderPayment function...');

try {
    // Read the file
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if function already exists
    if (content.includes('const verifyCustomOrderPayment = async')) {
        console.log('ℹ️ verifyCustomOrderPayment function already exists');
        return;
    }
    
    // Find processDesignRequest function and add verifyCustomOrderPayment before it
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
        
        // Write the updated content back
        fs.writeFileSync(filePath, content, 'utf8');
        
        console.log('✅ Successfully added verifyCustomOrderPayment function!');
        console.log('Now you need to manually add the payment verification buttons to the UI.');
        console.log('');
        console.log('Instructions:');
        console.log('1. Open TransactionPage.js');
        console.log('2. Find line ~3946 with "Add logic to view design details in modal if needed"');
        console.log('3. Add the payment verification buttons after the design approval buttons');
        console.log('4. The condition should be: request.status === "approved" && request.payment_proof_filename && request.payment_status !== "verified"');
        
    } else {
        console.log('❌ Could not find processDesignRequest function');
    }
    
} catch (error) {
    console.error('❌ Error:', error.message);
}
