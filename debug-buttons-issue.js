const fs = require('fs');

try {
  const content = fs.readFileSync('client/src/pages/TransactionPage.js', 'utf8');
  const lines = content.split('\n');

  console.log('=== DEBUGGING MISSING BUTTONS ===\n');

  // Check around line 3789 where dropdown should be
  console.log('Context around line 3789 (dropdown area):');
  for (let i = 3785; i < 3805 && i < lines.length; i++) {
    console.log('    ' + (i + 1) + ': ' + lines[i]);
  }

  console.log('\n=== Looking for table structure ===');
  
  // Find where the table rows are being rendered
  const tableRowPattern = 'PaymentVerificationTableRow';
  let foundTableRows = [];
  
  lines.forEach((line, index) => {
    if (line.includes(tableRowPattern)) {
      foundTableRows.push({ line: index + 1, content: line.trim() });
    }
  });

  console.log('PaymentVerificationTableRow instances:');
  foundTableRows.forEach(row => {
    console.log(`Line ${row.line}: ${row.content}`);
  });

  // Check if the custom order is being rendered correctly
  console.log('\n=== Checking for custom order rendering ===');
  
  const searchTerms = ['CUSTOM-', 'custom_order_id', 'verification_stage'];
  searchTerms.forEach(term => {
    const matches = lines.filter((line, index) => {
      if (line.includes(term)) {
        console.log(`Line ${index + 1}: ${line.trim()}`);
        return true;
      }
      return false;
    }).length;
    console.log(`Found ${matches} instances of "${term}"`);
  });

} catch (error) {
  console.error('Error:', error.message);
}
