const fs = require('fs');

try {
  const content = fs.readFileSync('client/src/pages/TransactionPage.js', 'utf8');
  const lines = content.split('\n');

  console.log('=== Context around ActionsContainer for custom orders (line 3672) ===\n');

  const startLine = 3650;
  const endLine = 3750;
  
  for (let i = startLine; i < endLine; i++) {
    if (i < lines.length) {
      const marker = i === 3671 ? '>>> ' : '    ';
      console.log(marker + (i + 1) + ': ' + lines[i]);
    }
  }

  console.log('\n=== Looking for custom order payment verification buttons ===\n');

  // Search for where custom order payment buttons should be
  const searchPatterns = [
    'verifyCustomOrderPayment',
    'custom.*payment.*verify',
    'custom.*order.*payment.*approve',
    'custom.*order.*payment.*reject'
  ];

  searchPatterns.forEach(pattern => {
    const regex = new RegExp(pattern, 'gi');
    lines.forEach((line, index) => {
      if (regex.test(line)) {
        console.log(`Pattern "${pattern}" found at line ${index + 1}: ${line.trim()}`);
      }
    });
  });

} catch (error) {
  console.error('Error:', error.message);
}
