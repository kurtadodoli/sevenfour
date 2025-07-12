const fs = require('fs');

try {
  const content = fs.readFileSync('client/src/pages/TransactionPage.js', 'utf8');
  const lines = content.split('\n');

  console.log('=== Finding Table Headers ===\n');

  // Look for table headers pattern - search for lines that contain multiple column names
  lines.forEach((line, index) => {
    if (line.includes('CUSTOMER') && (line.includes('AMOUNT') || line.includes('STATUS'))) {
      console.log(`Found potential table header at line ${index + 1}:`);
      // Show substantial context around this line
      for (let i = index - 10; i < index + 30; i++) {
        if (i >= 0 && i < lines.length) {
          const marker = i === index ? '>>> ' : '    ';
          console.log(marker + (i + 1) + ': ' + lines[i]);
        }
      }
      console.log('\n' + '='.repeat(80) + '\n');
    }
  });

} catch (error) {
  console.error('Error:', error.message);
}
