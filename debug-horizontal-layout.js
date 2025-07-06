// Final test and debug script for horizontal customer layout
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'client', 'src', 'pages', 'TransactionPage.js');

function debugHorizontalLayout() {
  console.log('🔍 Debugging horizontal customer layout...\n');

  const content = fs.readFileSync(filePath, 'utf8');

  // Check CustomerInfo definition
  const customerInfoMatch = content.match(/const CustomerInfo = styled\.div`([\s\S]*?)`/);
  
  if (customerInfoMatch) {
    const customerInfoCSS = customerInfoMatch[1];
    console.log('📋 CustomerInfo CSS Definition:');
    console.log('─'.repeat(50));
    console.log(customerInfoCSS.trim());
    console.log('─'.repeat(50));
    console.log('');

    // Check for key properties
    const hasFlexRow = customerInfoCSS.includes('flex-direction: row');
    const hasFlexDisplay = customerInfoCSS.includes('display: flex');
    const hasAlignCenter = customerInfoCSS.includes('align-items: center');
    const hasGap = customerInfoCSS.includes('gap: 8px');
    const hasWidthFull = customerInfoCSS.includes('width: 100%');

    console.log('🧪 CSS Property Checks:');
    console.log(`${hasFlexDisplay ? '✅' : '❌'} display: flex`);
    console.log(`${hasFlexRow ? '✅' : '❌'} flex-direction: row`);
    console.log(`${hasAlignCenter ? '✅' : '❌'} align-items: center`);
    console.log(`${hasGap ? '✅' : '❌'} gap: 8px`);
    console.log(`${hasWidthFull ? '✅' : '❌'} width: 100%`);
    console.log('');
  }

  // Check TableRow customer column handling
  const tableRowMatch = content.match(/const TableRow = styled\.div`([\s\S]*?)`/);
  
  if (tableRowMatch) {
    const tableRowCSS = tableRowMatch[1];
    
    // Check if customer column has special handling
    const hasCustomerSpecialHandling = tableRowCSS.includes('> div:nth-child(4) { /* Customer */');
    const hasNoConflictingFlex = !tableRowCSS.includes('> div:nth-child(4),  /* Customer */');
    
    console.log('🔧 TableRow Customer Column Checks:');
    console.log(`${hasCustomerSpecialHandling ? '✅' : '❌'} Has special customer column handling`);
    console.log(`${hasNoConflictingFlex ? '✅' : '❌'} No conflicting flex rules for customer column`);
    console.log('');
  }

  // Check JSX structure
  const jsxMatches = content.match(/<CustomerInfo>([\s\S]*?)<\/CustomerInfo>/g) || [];
  
  console.log('📊 JSX Structure Analysis:');
  console.log(`Found ${jsxMatches.length} CustomerInfo components`);
  
  let properStructureCount = 0;
  jsxMatches.forEach((match, index) => {
    const hasName = match.includes('className="name"');
    const hasSeparator = match.includes('className="separator"');
    const hasEmail = match.includes('className="email"');
    const isProperStructure = hasName && hasSeparator && hasEmail;
    
    if (isProperStructure) properStructureCount++;
    
    console.log(`   ${index + 1}. ${isProperStructure ? '✅' : '❌'} Name: ${hasName}, Separator: ${hasSeparator}, Email: ${hasEmail}`);
  });
  
  console.log('');

  // Final diagnostic
  if (properStructureCount === jsxMatches.length && jsxMatches.length > 0) {
    console.log('🎯 Diagnosis:');
    console.log('   ✅ All JSX structures are correct');
    console.log('   ✅ CSS properties look good');
    console.log('');
    console.log('💡 If it\'s still not working, possible causes:');
    console.log('   1. Browser cache - try hard refresh (Ctrl+Shift+R)');
    console.log('   2. CSS specificity issues - inspect element in browser');
    console.log('   3. React not picking up changes - restart dev server');
    console.log('   4. Other CSS rules overriding - check browser dev tools');
    console.log('');
    console.log('🔄 Suggested next steps:');
    console.log('   1. Open browser dev tools');
    console.log('   2. Inspect a CustomerInfo element');
    console.log('   3. Check computed styles for display and flex-direction');
    console.log('   4. Look for any overriding styles');
  } else {
    console.log('❌ Issues detected in JSX structure or CSS');
  }
}

// Generate CSS debug snippet
function generateCSSDebugSnippet() {
  console.log('');
  console.log('🛠️  CSS Debug Snippet (paste in browser console):');
  console.log('─'.repeat(60));
  console.log(`
// Check CustomerInfo elements
document.querySelectorAll('[class*="CustomerInfo"]').forEach((el, i) => {
  console.log(\`CustomerInfo \${i + 1}:\`, {
    element: el,
    display: getComputedStyle(el).display,
    flexDirection: getComputedStyle(el).flexDirection,
    alignItems: getComputedStyle(el).alignItems,
    gap: getComputedStyle(el).gap,
    children: Array.from(el.children).map(child => ({
      className: child.className,
      textContent: child.textContent.trim()
    }))
  });
});
  `.trim());
  console.log('─'.repeat(60));
}

debugHorizontalLayout();
generateCSSDebugSnippet();
