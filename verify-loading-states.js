const fs = require('fs');

try {
  const content = fs.readFileSync('client/src/pages/TransactionPage.js', 'utf8');
  const lines = content.split('\n');

  console.log('=== Verifying Loading States for Payment Buttons ===\n');

  // Check the areas around lines 3720 and 3730 for the loading props
  [3720, 3735].forEach(startLine => {
    console.log(`Context around line ${startLine}:`);
    for (let i = startLine - 2; i < startLine + 12; i++) {
      if (i < lines.length && i >= 0) {
        const line = lines[i];
        const marker = (line.includes('loading=') || line.includes('disabled=')) ? '>>> ' : '    ';
        console.log(marker + (i + 1) + ': ' + line);
      }
    }
    console.log('\n' + '='.repeat(60) + '\n');
  });

} catch (error) {
  console.error('Error:', error.message);
}
