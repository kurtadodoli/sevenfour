// Backup and restore DeliveryPage.js
console.log('Creating backup and fixing DeliveryPage.js structure...');

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'client/src/pages/DeliveryPage.js');
const backupPath = path.join(__dirname, 'client/src/pages/DeliveryPage.js.backup');

try {
  // Create backup
  const content = fs.readFileSync(filePath, 'utf8');
  fs.writeFileSync(backupPath, content);
  console.log('✅ Backup created at:', backupPath);
  
  // Check for basic structure issues
  const lines = content.split('\n');
  console.log('📊 File analysis:');
  console.log('Total lines:', lines.length);
  
  // Look for JSX structure issues
  let openTags = 0;
  let closeTags = 0;
  let braceCount = 0;
  
  lines.forEach((line, index) => {
    // Count JSX tags
    const openMatches = line.match(/<\w+[^>]*>/g);
    const closeMatches = line.match(/<\/\w+>/g);
    const selfClosingMatches = line.match(/<\w+[^>]*\/>/g);
    
    if (openMatches) openTags += openMatches.length;
    if (closeMatches) closeTags += closeMatches.length;
    if (selfClosingMatches) openTags -= selfClosingMatches.length; // Self-closing don't need closing tags
    
    // Count braces
    const openBraces = (line.match(/\{/g) || []).length;
    const closeBraces = (line.match(/\}/g) || []).length;
    braceCount += openBraces - closeBraces;
    
    // Look for problematic lines
    if (line.includes('};') && line.includes('const') && index < lines.length - 10) {
      console.log(`⚠️ Potential issue at line ${index + 1}: ${line.trim()}`);
    }
  });
  
  console.log('Open tags:', openTags);
  console.log('Close tags:', closeTags);
  console.log('Tag balance:', openTags - closeTags);
  console.log('Brace balance:', braceCount);
  
  if (openTags !== closeTags) {
    console.log('❌ JSX tag mismatch detected');
  }
  
  if (braceCount !== 0) {
    console.log('❌ Brace mismatch detected');
  }
  
} catch (error) {
  console.error('❌ Error analyzing file:', error);
}
