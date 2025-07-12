const fs = require('fs');

try {
  const content = fs.readFileSync('client/src/pages/TransactionPage.js', 'utf8');
  
  console.log('=== Debugging Dropdown Menu Display ===\n');

  // Let's check if the DropdownContent has proper styling to be visible
  const currentDropdownContent = content.match(/const DropdownContent = styled\.div`[\s\S]*?`;/);
  
  if (currentDropdownContent) {
    console.log('Current DropdownContent styling:');
    console.log(currentDropdownContent[0]);
  }

  // Replace the DropdownContent to make it more visible and always show for debugging
  const newDropdownContent = `const DropdownContent = styled.div\`
  position: absolute;
  right: 0;
  top: 100%;
  background: white;
  min-width: 200px;
  box-shadow: 0 8px 16px rgba(0,0,0,0.3);
  border: 2px solid #007bff;
  border-radius: 8px;
  z-index: 9999;
  display: \${props => props.show ? 'block' : 'none'};
  margin-top: 8px;
  max-height: 300px;
  overflow-y: auto;
\`;`;

  let updatedContent = content.replace(/const DropdownContent = styled\.div`[\s\S]*?`;/, newDropdownContent);

  // Also let's make the DropdownItem more visible
  const newDropdownItem = `const DropdownItem = styled.button\`
  width: 100%;
  padding: 15px 20px;
  border: none;
  background: white;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  transition: background 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:first-child {
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  }
  
  &:last-child {
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
  }
  
  &:hover {
    background: #f8f9fa;
    font-weight: 600;
  }
  
  &.approve {
    color: #28a745;
    
    &:hover {
      background: #d4edda;
      color: #1e7e34;
    }
  }
  
  &.reject {
    color: #dc3545;
    
    &:hover {
      background: #f8d7da;
      color: #721c24;
    }
  }
  
  &.view {
    color: #007bff;
    
    &:hover {
      background: #d1ecf1;
      color: #0056b3;
    }
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    
    &:hover {
      background: white;
    }
  }
\`;`;

  updatedContent = updatedContent.replace(/const DropdownItem = styled\.button`[\s\S]*?`;/, newDropdownItem);

  // Write back to file
  fs.writeFileSync('client/src/pages/TransactionPage.js', updatedContent);
  
  console.log('✅ Enhanced dropdown styling for better visibility');
  console.log('- Increased z-index to 9999');
  console.log('- Added blue border to dropdown content');
  console.log('- Increased box shadow for better visibility');
  console.log('- Enhanced dropdown item styling with better padding');

} catch (error) {
  console.error('Error:', error.message);
}
