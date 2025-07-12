const fs = require('fs');

try {
  const content = fs.readFileSync('client/src/pages/TransactionPage.js', 'utf8');
  
  console.log('=== Adding Dropdown State Management ===\n');

  // Find where other state is defined (around buttonLoading)
  const statePosition = content.indexOf('const [buttonLoading, setButtonLoading] = useState({});');
  
  if (statePosition === -1) {
    throw new Error('Could not find buttonLoading state to add dropdown state');
  }

  // Add dropdown state after buttonLoading
  const dropdownState = `
  const [openDropdown, setOpenDropdown] = useState(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !event.target.closest('.dropdown-menu')) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);`;

  // Find the end of the buttonLoading line
  const lineEnd = content.indexOf(';', statePosition) + 1;
  
  // Insert the dropdown state
  const updatedContent = content.slice(0, lineEnd) + dropdownState + content.slice(lineEnd);

  // Write back to file
  fs.writeFileSync('client/src/pages/TransactionPage.js', updatedContent);
  
  console.log('✅ Added dropdown state management');
  console.log('- openDropdown state for tracking which dropdown is open');
  console.log('- useEffect for handling clicks outside dropdown');

} catch (error) {
  console.error('Error:', error.message);
}
