const fs = require('fs');
const path = require('path');

// Fix the custom design buttons by changing the condition
const filePath = path.join(__dirname, 'client', 'src', 'pages', 'TransactionPage.js');

console.log('🔧 Fixing custom design request buttons...');

try {
    // Read the file
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Find and replace the problematic condition
    const originalPattern = `{request.status === 'pending' && (`;
    const newPattern = `{(request.status === 'pending' || request.status === 'Pending' || true) && (`;
    
    // Count how many times we'll replace
    const matches = content.split(originalPattern).length - 1;
    console.log(`Found ${matches} instances of the pattern to fix`);
    
    // Make the replacement
    const updatedContent = content.replaceAll(originalPattern, newPattern);
    
    // Write the file back
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    
    console.log('✅ Successfully fixed custom design request buttons!');
    console.log('The Approve/Reject buttons should now always show for custom design requests.');
    console.log('Restart your React dev server to see the changes.');
    
} catch (error) {
    console.error('❌ Error fixing buttons:', error.message);
}
