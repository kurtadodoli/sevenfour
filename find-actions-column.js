const fs = require('fs');

try {
  const content = fs.readFileSync('client/src/pages/TransactionPage.js', 'utf8');
  const lines = content.split('\n');

  console.log('=== Finding ACTIONS Column in Data Rows ===\n');

  // Look for the end of the payment verification table row where actions should be
  const startLine = 3650;
  const endLine = 3750;
  
  console.log(`Checking lines ${startLine} to ${endLine} for current structure:`);
  for (let i = startLine; i < endLine && i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('ActionsContainer') || 
        line.includes('ActionButton') ||
        line.includes('</PaymentVerificationTableRow>') ||
        line.includes('Actions') ||
        line.includes('Button') ||
        line.includes('onClick')) {
      const marker = line.includes('ActionsContainer') ? '>>> ' : '    ';
      console.log(marker + (i + 1) + ': ' + line);
    }
  }

  console.log('\n=== Looking for the last column in the data rows ===');
  
  // Find lines that end the table row data
  for (let i = 3600; i < 3750 && i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('</div>') && line.trim() === '</div>') {
      console.log(`    ${i + 1}: ${line} (potential end of data columns)`);
    }
  }

} catch (error) {
  console.error('Error:', error.message);
}
