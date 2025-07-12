const fs = require('fs');

try {
  const content = fs.readFileSync('client/src/pages/TransactionPage.js', 'utf8');
  const lines = content.split('\n');

  console.log('=== CHECKING TABLE ROW STRUCTURE ===\n');

  // Find the table row rendering area (around line 3546)
  const start = 3540;
  const end = 3880;
  
  console.log(`Showing lines ${start} to ${end} to see full table row structure:`);
  
  for (let i = start; i < end && i < lines.length; i++) {
    const line = lines[i];
    // Highlight important parts
    const marker = (
      line.includes('PaymentVerificationTableRow') ||
      line.includes('DropdownMenu') ||
      line.includes('verification_stage') ||
      line.includes('</div>') && line.trim() === '</div>'
    ) ? '>>> ' : '    ';
    
    console.log(marker + (i + 1) + ': ' + line);
  }

} catch (error) {
  console.error('Error:', error.message);
}
