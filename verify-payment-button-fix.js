const fs = require('fs');

try {
  const content = fs.readFileSync('client/src/pages/TransactionPage.js', 'utf8');
  const lines = content.split('\n');

  console.log('=== Verifying Custom Order Payment Button Fix ===\n');

  // Check the fixed lines
  const targetLines = [3723, 3733];
  targetLines.forEach(lineNum => {
    if (lineNum <= lines.length) {
      console.log(`Line ${lineNum}: ${lines[lineNum - 1].trim()}`);
    }
  });

  console.log('\n=== Checking if buttons have loading states ===\n');

  // Find context around these lines to see if loading states are present
  const contextLines = [];
  [3720, 3730].forEach(startLine => {
    console.log(`Context around line ${startLine}:`);
    for (let i = startLine - 2; i < startLine + 10; i++) {
      if (i < lines.length && i >= 0) {
        const marker = (i === 3722 || i === 3732) ? '>>> ' : '    ';
        console.log(marker + (i + 1) + ': ' + lines[i]);
      }
    }
    console.log('');
  });

} catch (error) {
  console.error('Error:', error.message);
}
