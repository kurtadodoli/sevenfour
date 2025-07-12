const fs = require('fs');

try {
  const content = fs.readFileSync('client/src/pages/TransactionPage.js', 'utf8');
  const lines = content.split('\n');

  console.log('=== Finding Design Requests Section ===\n');

  // Find the design requests section starting around line 3884
  const startLine = 3880;
  const endLine = 3980;
  
  for (let i = startLine; i < endLine && i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('design-requests') || 
        line.includes('processDesignRequest') ||
        line.includes('Approve') ||
        line.includes('Reject') ||
        line.includes('ActionButton') ||
        line.includes('custom_order_id')) {
      const marker = line.includes('processDesignRequest') ? '>>> ' : '    ';
      console.log(marker + (i + 1) + ': ' + line);
    }
  }

} catch (error) {
  console.error('Error:', error.message);
}
