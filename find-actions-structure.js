const fs = require('fs');

try {
  const content = fs.readFileSync('client/src/pages/TransactionPage.js', 'utf8');
  const lines = content.split('\n');

  console.log('=== Finding Actions Column Structure ===\n');

  // Look for the specific pattern around line 3400-3500 where the actions column should be
  const startLine = 3400;
  const endLine = 3500;
  
  console.log(`Checking lines ${startLine} to ${endLine} for actions structure:`);
  for (let i = startLine; i < endLine && i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('ACTION') || 
        line.includes('button') || 
        line.includes('onClick') ||
        line.includes('⋮') ||
        line.includes('threeDots') ||
        line.includes('menu')) {
      console.log(`Line ${i + 1}: ${line.trim()}`);
    }
  }

  console.log('\n=== Looking at the image from screenshot context ===');
  // Based on the screenshot, there should be a three-dots menu (⋮) in the actions column
  // Let me search for the actual table structure

  const tableHeaders = [];
  lines.forEach((line, index) => {
    if (line.includes('CUSTOMER') && line.includes('AMOUNT') && line.includes('STATUS')) {
      console.log(`Table header found at line ${index + 1}: ${line.trim()}`);
      // Show context around this line
      for (let i = index - 5; i < index + 15; i++) {
        if (i >= 0 && i < lines.length) {
          const marker = i === index ? '>>> ' : '    ';
          console.log(marker + (i + 1) + ': ' + lines[i]);
        }
      }
    }
  });

} catch (error) {
  console.error('Error:', error.message);
}
