const fs = require('fs');

try {
  const content = fs.readFileSync('client/src/pages/TransactionPage.js', 'utf8');
  
  console.log('=== Making Dropdown Button More Visible ===\n');

  // Replace the DropdownButton styling to make it more visible
  const oldButtonStyle = `const DropdownButton = styled.button\`
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 18px;
  color: #666;
  transition: all 0.2s ease;
  
  &:hover {
    background: #e9ecef;
    border-color: #ccc;
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
  }
\`;`;

  const newButtonStyle = `const DropdownButton = styled.button\`
  background: #ffffff;
  border: 2px solid #007bff;
  border-radius: 6px;
  padding: 10px 14px;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
  color: #007bff;
  transition: all 0.2s ease;
  min-width: 44px;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  
  &:hover {
    background: #007bff;
    color: white;
    transform: scale(1.05);
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(0,123,255,0.25);
  }
  
  &:active {
    transform: scale(0.95);
  }
\`;`;

  let updatedContent = content.replace(oldButtonStyle, newButtonStyle);

  // Also make the three-dots more visible - replace ⋮ with a more visible button text
  updatedContent = updatedContent.replace(
    />\s*⋮\s*</g,
    '>ACTIONS<'
  );

  // Write back to file
  fs.writeFileSync('client/src/pages/TransactionPage.js', updatedContent);
  
  console.log('✅ Made dropdown button more visible');
  console.log('- Changed button styling to blue border with white background');
  console.log('- Added hover effects and shadows');
  console.log('- Changed ⋮ to "ACTIONS" text for better visibility');
  console.log('- Added minimum width and height');

} catch (error) {
  console.error('Error:', error.message);
}
