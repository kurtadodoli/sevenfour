const fs = require('fs');
const path = require('path');

// Insert payment verification buttons into custom design requests ActionsContainer
const filePath = path.join(__dirname, 'client', 'src', 'pages', 'TransactionPage.js');

console.log('🔧 Inserting payment verification buttons...');

try {
    // Read the file content
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Split into lines for easier manipulation
    const lines = content.split('\n');
    
    // Find the line with "Add logic to view design details in modal if needed"
    let targetLineIndex = -1;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('Add logic to view design details in modal if needed')) {
            targetLineIndex = i;
            break;
        }
    }
    
    if (targetLineIndex === -1) {
        console.log('❌ Could not find target line');
        return;
    }
    
    console.log('Found target line at index ' + (targetLineIndex + 1));
    
    // Check if payment verification buttons already exist
    const nextFewLines = lines.slice(targetLineIndex, targetLineIndex + 20).join('\n');
    if (nextFewLines.includes('Payment Verification Buttons')) {
        console.log('ℹ️ Payment verification buttons already exist');
        return;
    }
    
    // Find the line with the closing of the design approval section "})}"
    let insertAfterIndex = -1;
    for (let i = targetLineIndex - 20; i < targetLineIndex; i++) {
        if (lines[i] && lines[i].trim() === ')}') {
            insertAfterIndex = i;
            break;
        }
    }
    
    if (insertAfterIndex === -1) {
        console.log('❌ Could not find insertion point');
        return;
    }
    
    console.log('Will insert after line ' + (insertAfterIndex + 1));
    
    // Create the payment verification buttons code
    const buttonLines = [
        '',
        '                              {/* Payment Verification Buttons (for approved requests with payment submitted) */}',
        '                              {request.status === \'approved\' && request.payment_proof_filename && request.payment_status !== \'verified\' && (',
        '                                <>',
        '                                  <ActionButton',
        '                                    variant="view"',
        '                                    onClick={(e) => {',
        '                                      e.stopPropagation();',
        '                                      const imagePath = `/uploads/payment-proofs/${request.payment_proof_filename}`;',
        '                                      const customerName = request.customer_name || [request.first_name, request.last_name].filter(Boolean).join(" ") || "Unknown";',
        '                                      const gcashRef = request.gcash_reference_number || request.payment_reference || request.gcash_reference;',
        '                                      viewPaymentProof(imagePath, customerName, request.custom_order_id, gcashRef, request);',
        '                                    }}',
        '                                    title="View Payment Proof"',
        '                                  >',
        '                                    <FontAwesomeIcon icon={faEye} />',
        '                                  </ActionButton>',
        '                                  <ActionButton',
        '                                    variant="approve"',
        '                                    onClick={(e) => {',
        '                                      e.stopPropagation();',
        '                                      verifyCustomOrderPayment(request.custom_order_id, \'verified\');',
        '                                    }}',
        '                                    loading={buttonLoading[`payment_${request.custom_order_id}_approve`]}',
        '                                    disabled={buttonLoading[`payment_${request.custom_order_id}_approve`] || buttonLoading[`payment_${request.custom_order_id}_reject`]}',
        '                                    title="Approve Payment"',
        '                                  >',
        '                                    <FontAwesomeIcon icon={faCheck} />',
        '                                  </ActionButton>',
        '                                  <ActionButton',
        '                                    variant="reject"',
        '                                    onClick={(e) => {',
        '                                      e.stopPropagation();',
        '                                      verifyCustomOrderPayment(request.custom_order_id, \'rejected\');',
        '                                    }}',
        '                                    loading={buttonLoading[`payment_${request.custom_order_id}_reject`]}',
        '                                    disabled={buttonLoading[`payment_${request.custom_order_id}_approve`] || buttonLoading[`payment_${request.custom_order_id}_reject`]}',
        '                                    title="Reject Payment"',
        '                                  >',
        '                                    <FontAwesomeIcon icon={faTimes} />',
        '                                  </ActionButton>',
        '                                </>',
        '                              )}'
    ];
    
    // Insert the new lines
    lines.splice(insertAfterIndex + 1, 0, ...buttonLines);
    
    // Join back and write to file
    const updatedContent = lines.join('\n');
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    
    console.log('✅ Successfully added payment verification buttons!');
    console.log('');
    console.log('The payment verification buttons will now show for custom orders that are:');
    console.log('- Status: "approved" (design already approved)');
    console.log('- Have payment_proof_filename (customer submitted payment proof)');
    console.log('- payment_status is not "verified" (payment not yet verified)');
    console.log('');
    console.log('Buttons added:');
    console.log('👁️ View Payment Proof - Shows the uploaded payment image');
    console.log('✅ Approve Payment - Marks payment as verified');
    console.log('❌ Reject Payment - Rejects the payment');
    console.log('');
    console.log('Restart your React dev server to see the changes!');
    
} catch (error) {
    console.error('❌ Error:', error.message);
}
