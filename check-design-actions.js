const fs = require('fs');

try {
  const content = fs.readFileSync('client/src/pages/TransactionPage.js', 'utf8');
  const lines = content.split('\n');

  console.log('=== Design Requests Actions Section ===\n');

  // Get the actions section for design requests
  const startLine = 4045;
  const endLine = 4120;
  
  for (let i = startLine; i < endLine && i < lines.length; i++) {
    console.log('    ' + (i + 1) + ': ' + lines[i]);
  }

} catch (error) {
  console.error('Error:', error.message);
}
