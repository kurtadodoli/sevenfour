const fs = require('fs');

try {
  const content = fs.readFileSync('client/src/pages/TransactionPage.js', 'utf8');
  const lines = content.split('\n');

  console.log('=== Checking Payment Verification Buttons ===\n');

  // Find the context around the View Payment Proof buttons
  [3088, 3715].forEach(lineNum => {
    console.log(`Context around line ${lineNum}:`);
    const start = Math.max(0, lineNum - 10);
    const end = Math.min(lines.length, lineNum + 10);
    for (let i = start; i < end; i++) {
      const marker = i === (lineNum - 1) ? '>>> ' : '    ';
      console.log(marker + (i + 1) + ': ' + lines[i]);
    }
    console.log('\n' + '='.repeat(60) + '\n');
  });

  // Check for payment verification function
  const verifyFunctionMatch = content.match(/const verifyCustomOrderPayment[\s\S]*?};/);
  if (verifyFunctionMatch) {
    console.log('Payment verification function found:');
    console.log(verifyFunctionMatch[0].substring(0, 500) + '...');
  }

  // Search for specific payment button patterns
  const paymentButtonPatterns = [
    'Approve Payment',
    'Reject Payment',
    'View Payment Proof',
    'payment_verified',
    'payment_rejected'
  ];

  paymentButtonPatterns.forEach(pattern => {
    const matches = [...content.matchAll(new RegExp(pattern, 'gi'))];
    if (matches.length > 0) {
      console.log(`\nFound ${matches.length} instances of "${pattern}"`);
    }
  });

} catch (error) {
  console.error('Error reading file:', error.message);
}
