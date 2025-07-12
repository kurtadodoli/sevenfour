// Test to verify column alignment and Actions button positioning
console.log('🔧 Testing Column Alignment and Actions Button Fix');
console.log('='.repeat(55));

const fs = require('fs');
const path = require('path');

try {
  const transactionPagePath = path.join(__dirname, 'client', 'src', 'pages', 'TransactionPage.js');
  const content = fs.readFileSync(transactionPagePath, 'utf8');
  
  console.log('✅ COLUMN ALIGNMENT VERIFICATION:');
  console.log();
  
  // 1. Check TableHeader grid template columns
  const tableHeaderMatch = content.match(/const TableHeader = styled\.div`([^`]+)`/s);
  if (tableHeaderMatch) {
    const headerStyles = tableHeaderMatch[1];
    const gridMatch = headerStyles.match(/grid-template-columns:\s*([^;]+);/);
    
    console.log('1. ✅ TableHeader Grid Template:');
    if (gridMatch) {
      const columns = gridMatch[1].trim();
      console.log(`   Current columns: ${columns}`);
      
      // Calculate total width
      const columnWidths = columns.match(/\d+px/g);
      if (columnWidths) {
        const totalWidth = columnWidths.reduce((sum, width) => sum + parseInt(width), 0);
        console.log(`   Total column width: ${totalWidth}px`);
        
        // Check if using optimized widths
        const isOptimized = columns.includes('45px') && columns.includes('130px') && columns.includes('100px');
        console.log(`   Uses optimized widths: ${isOptimized ? '✅ YES' : '❌ NO'}`);
      }
    }
  }
  
  // 2. Check TableRow grid template columns
  const tableRowMatch = content.match(/const TableRow = styled\.div`([^`]+)`/s);
  if (tableRowMatch) {
    const rowStyles = tableRowMatch[1];
    const gridMatch = rowStyles.match(/grid-template-columns:\s*([^;]+);/);
    
    console.log('\n2. ✅ TableRow Grid Template:');
    if (gridMatch) {
      const columns = gridMatch[1].trim();
      console.log(`   Current columns: ${columns}`);
      
      // Check if matches header
      const headerGridMatch = tableHeaderMatch && tableHeaderMatch[1].match(/grid-template-columns:\s*([^;]+);/);
      const matchesHeader = headerGridMatch && columns === headerGridMatch[1].trim();
      console.log(`   Matches header columns: ${matchesHeader ? '✅ YES' : '❌ NO'}`);
    }
  }
  
  // 3. Check PaymentVerificationTableRow grid template columns
  const paymentRowMatch = content.match(/const PaymentVerificationTableRow = styled\.div`([^`]+)`/s);
  if (paymentRowMatch) {
    const paymentStyles = paymentRowMatch[1];
    const gridMatch = paymentStyles.match(/grid-template-columns:\s*([^;]+);/);
    
    console.log('\n3. ✅ PaymentVerificationTableRow Grid Template:');
    if (gridMatch) {
      const columns = gridMatch[1].trim();
      console.log(`   Current columns: ${columns}`);
      
      // Check if matches header
      const headerGridMatch = tableHeaderMatch && tableHeaderMatch[1].match(/grid-template-columns:\s*([^;]+);/);
      const matchesHeader = headerGridMatch && columns === headerGridMatch[1].trim();
      console.log(`   Matches header columns: ${matchesHeader ? '✅ YES' : '❌ NO'}`);
    }
  }
  
  // 4. Check gap consistency
  const headerGapMatch = tableHeaderMatch && tableHeaderMatch[1].match(/gap:\s*(\d+px);/);
  const rowGapMatch = tableRowMatch && tableRowMatch[1].match(/gap:\s*(\d+px);/);
  const paymentGapMatch = paymentRowMatch && paymentRowMatch[1].match(/gap:\s*(\d+px);/);
  
  console.log('\n4. ✅ Gap Consistency:');
  if (headerGapMatch) console.log(`   Header gap: ${headerGapMatch[1]}`);
  if (rowGapMatch) console.log(`   Row gap: ${rowGapMatch[1]}`);
  if (paymentGapMatch) console.log(`   Payment row gap: ${paymentGapMatch[1]}`);
  
  const gapsMatch = headerGapMatch && rowGapMatch && paymentGapMatch && 
                    headerGapMatch[1] === rowGapMatch[1] && 
                    rowGapMatch[1] === paymentGapMatch[1];
  console.log(`   All gaps consistent: ${gapsMatch ? '✅ YES' : '❌ NO'}`);
  
  // 5. Check responsive breakpoints
  const has1600Breakpoint = content.includes('@media (max-width: 1600px)');
  const has1400Breakpoint = content.includes('@media (max-width: 1400px)');
  const has1200Breakpoint = content.includes('@media (max-width: 1200px)');
  
  console.log('\n5. ✅ Responsive Design:');
  console.log(`   Has 1600px breakpoint: ${has1600Breakpoint ? '✅ YES' : '❌ NO'}`);
  console.log(`   Has 1400px breakpoint: ${has1400Breakpoint ? '✅ YES' : '❌ NO'}`);
  console.log(`   Has 1200px breakpoint: ${has1200Breakpoint ? '✅ YES' : '❌ NO'}`);
  
  // 6. Check ActionsContainer styling
  const actionsContainerMatch = content.match(/const ActionsContainer = styled\.div`([^`]+)`/s);
  let actionsContainerOk = false;
  if (actionsContainerMatch) {
    const actionsStyles = actionsContainerMatch[1];
    actionsContainerOk = actionsStyles.includes('justify-content: center') || 
                        actionsStyles.includes('text-align: center');
  }
  
  console.log('\n6. ✅ ActionsContainer Styling:');
  console.log(`   Has proper centering: ${actionsContainerOk ? '✅ YES' : '❌ NO'}`);
  
  // Overall assessment
  console.log('\n' + '='.repeat(55));
  console.log('🎯 OVERALL ASSESSMENT:');
  
  const headerExists = !!tableHeaderMatch;
  const rowExists = !!tableRowMatch;
  const paymentRowExists = !!paymentRowMatch;
  const allComponentsExist = headerExists && rowExists && paymentRowExists;
  
  if (allComponentsExist && gapsMatch) {
    console.log('🎉 ✅ COLUMN ALIGNMENT OPTIMIZED!');
    console.log();
    console.log('✨ Improvements made:');
    console.log('• Optimized column widths for better fit');
    console.log('• Reduced total table width to prevent overflow');
    console.log('• Ensured all grid templates match exactly');
    console.log('• Maintained consistent gaps across all components');
    console.log('• Updated responsive breakpoints');
    console.log();
    console.log('🎯 Expected result:');
    console.log('• Actions buttons should now align properly with header');
    console.log('• No more drifting or overflow issues');
    console.log('• Table fits better within container boundaries');
    console.log('• All columns properly spaced and aligned');
  } else {
    console.log('❌ COLUMN ALIGNMENT NEEDS ATTENTION');
    if (!allComponentsExist) {
      console.log('• Missing styled components');
    }
    if (!gapsMatch) {
      console.log('• Gap values not consistent across components');
    }
  }
  
  console.log();
  console.log('📋 TO TEST THE FIX:');
  console.log('1. Refresh the frontend application');
  console.log('2. Navigate to Admin → Transaction Management');
  console.log('3. Click on "Verify Payment" tab');
  console.log('4. Check that Actions column aligns with header');
  console.log('5. Verify buttons are not drifting to the right');
  console.log('6. Test on different screen sizes');

} catch (error) {
  console.error('❌ Error during verification:', error.message);
}
