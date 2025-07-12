// Find the verifyPayment function in TransactionPage.js and show the current implementation
const fs = require('fs');

try {
  const filePath = 'c:/sfc/client/src/pages/TransactionPage.js';
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Find the verifyPayment function
  const lines = content.split('\n');
  let startIndex = -1;
  let endIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('const verifyPayment = async')) {
      startIndex = i;
      break;
    }
  }
  
  if (startIndex !== -1) {
    // Find the end of the function (look for closing brace at the same indentation level)
    const startIndent = lines[startIndex].search(/\S/);
    for (let i = startIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line === '};' || (line.startsWith('}') && lines[i].search(/\S/) <= startIndent)) {
        endIndex = i;
        break;
      }
    }
    
    if (endIndex !== -1) {
      console.log('🔍 Found verifyPayment function:');
      console.log(`Lines ${startIndex + 1} to ${endIndex + 1}:`);
      console.log('='.repeat(50));
      for (let i = startIndex; i <= endIndex; i++) {
        console.log(`${i + 1}: ${lines[i]}`);
      }
      console.log('='.repeat(50));
    }
  } else {
    console.log('❌ verifyPayment function not found');
  }
  
} catch (error) {
  console.error('❌ Error reading file:', error.message);
}
