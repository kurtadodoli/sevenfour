const fs = require('fs');

try {
  const content = fs.readFileSync('client/src/pages/TransactionPage.js', 'utf8');
  const lines = content.split('\n');

  console.log('=== Searching for Custom Order Payment Verification Logic ===\n');

  // Find lines that contain both custom order and payment verification logic
  const relevantLines = [];
  lines.forEach((line, index) => {
    if (line.includes('custom_order') && 
        (line.includes('payment') || line.includes('verify') || line.includes('approve') || line.includes('reject'))) {
      relevantLines.push({ line: line.trim(), number: index + 1 });
    }
  });

  console.log('Lines with custom order payment logic:');
  relevantLines.forEach(item => {
    console.log(`Line ${item.number}: ${item.line}`);
  });

  // Look for the ActionsContainer where payment verification buttons should be
  const actionsContainerMatches = [];
  const actionContainerRegex = /ActionsContainer|Actions.*container|action.*button/gi;
  lines.forEach((line, index) => {
    if (actionContainerRegex.test(line)) {
      actionsContainerMatches.push({ line: line.trim(), number: index + 1 });
    }
  });

  console.log('\n=== ActionsContainer instances ===');
  actionsContainerMatches.slice(0, 10).forEach(item => {
    console.log(`Line ${item.number}: ${item.line}`);
  });

  // Look for custom order table rendering
  console.log('\n=== Looking for custom order table rendering ===');
  const customOrderTableLines = [];
  lines.forEach((line, index) => {
    if (line.includes('custom') && line.includes('order') && 
        (line.includes('map') || line.includes('table') || line.includes('row'))) {
      customOrderTableLines.push({ line: line.trim(), number: index + 1 });
    }
  });

  customOrderTableLines.slice(0, 15).forEach(item => {
    console.log(`Line ${item.number}: ${item.line}`);
  });

} catch (error) {
  console.error('Error:', error.message);
}
