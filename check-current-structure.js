const fs = require('fs');

try {
  const content = fs.readFileSync('client/src/pages/TransactionPage.js', 'utf8');
  const lines = content.split('\n');

  console.log('=== Checking Current Payment Verification Section ===\n');

  // Find the ACTIONS column and dropdown structure
  const actionsColumnLines = [];
  lines.forEach((line, index) => {
    if (line.includes('ACTIONS') || 
        (line.includes('dropdown') && line.includes('Action')) ||
        line.includes('ActionsContainer') ||
        line.includes('ActionButton')) {
      actionsColumnLines.push({ line: line.trim(), number: index + 1 });
    }
  });

  console.log('Actions-related lines:');
  actionsColumnLines.slice(0, 15).forEach(item => {
    console.log(`Line ${item.number}: ${item.line}`);
  });

  console.log('\n=== Looking for current custom order rendering ===');

  // Find where custom orders are rendered in the payment verification table
  const customOrderLines = [];
  let inCustomOrderSection = false;
  
  lines.forEach((line, index) => {
    if (line.includes('CUSTOM') && line.includes('order')) {
      inCustomOrderSection = true;
    }
    
    if (inCustomOrderSection && index < lines.length - 20) {
      customOrderLines.push({ line: line.trim(), number: index + 1 });
      
      if (customOrderLines.length > 30) {
        inCustomOrderSection = false;
      }
    }
  });

  console.log('Custom order rendering section:');
  customOrderLines.slice(0, 20).forEach(item => {
    console.log(`Line ${item.number}: ${item.line}`);
  });

} catch (error) {
  console.error('Error:', error.message);
}
