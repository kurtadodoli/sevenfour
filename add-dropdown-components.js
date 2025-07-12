const fs = require('fs');

try {
  const content = fs.readFileSync('client/src/pages/TransactionPage.js', 'utf8');
  
  console.log('=== Adding Dropdown Actions Menu for Custom Orders ===\n');

  // First, let's add a styled dropdown component
  const dropdownComponent = `
// Dropdown Menu Component for Actions
const DropdownMenu = styled.div\`
  position: relative;
  display: inline-block;
\`;

const DropdownButton = styled.button\`
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
\`;

const DropdownContent = styled.div\`
  position: absolute;
  right: 0;
  top: 100%;
  background: white;
  min-width: 180px;
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  z-index: 1000;
  display: \${props => props.show ? 'block' : 'none'};
  margin-top: 4px;
\`;

const DropdownItem = styled.button\`
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: white;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  transition: background 0.2s ease;
  
  &:first-child {
    border-top-left-radius: 6px;
    border-top-right-radius: 6px;
  }
  
  &:last-child {
    border-bottom-left-radius: 6px;
    border-bottom-right-radius: 6px;
  }
  
  &:hover {
    background: #f8f9fa;
  }
  
  &.approve {
    color: #28a745;
    
    &:hover {
      background: #d4edda;
    }
  }
  
  &.reject {
    color: #dc3545;
    
    &:hover {
      background: #f8d7da;
    }
  }
  
  &.view {
    color: #007bff;
    
    &:hover {
      background: #d1ecf1;
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

  // Find where to insert the dropdown component (after other styled components)
  const insertPosition = content.indexOf('const ActionsContainer = styled.div`');
  
  if (insertPosition === -1) {
    throw new Error('Could not find ActionsContainer to insert dropdown components');
  }

  // Insert the dropdown components before ActionsContainer
  const updatedContent = content.slice(0, insertPosition) + dropdownComponent + '\n\n' + content.slice(insertPosition);

  // Write back to file
  fs.writeFileSync('client/src/pages/TransactionPage.js', updatedContent);
  
  console.log('✅ Added dropdown menu components');
  console.log('- DropdownMenu: Container component');
  console.log('- DropdownButton: Three-dots button');
  console.log('- DropdownContent: Menu content');
  console.log('- DropdownItem: Individual menu items');

} catch (error) {
  console.error('Error:', error.message);
}
