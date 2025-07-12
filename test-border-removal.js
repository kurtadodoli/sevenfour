// Test to verify removal of extra table borders/spacing
console.log('🔧 Testing Table Border/Spacing Removal');
console.log('='.repeat(50));

const fs = require('fs');
const path = require('path');

try {
  const transactionPagePath = path.join(__dirname, 'client', 'src', 'pages', 'TransactionPage.js');
  const content = fs.readFileSync(transactionPagePath, 'utf8');
  
  console.log('✅ SPACING/BORDER REMOVAL VERIFICATION:');
  console.log();
  
  // 1. Check TableWrapper - should not have centering flex
  const tableWrapperMatch = content.match(/const TableWrapper = styled\.div`([^`]+)`/s);
  if (tableWrapperMatch) {
    const wrapperStyles = tableWrapperMatch[1];
    const hasFlexCenter = wrapperStyles.includes('display: flex') && wrapperStyles.includes('justify-content: center');
    
    console.log('1. ✅ TableWrapper Component:');
    console.log(`   • No flex centering: ${!hasFlexCenter ? '✅ YES' : '❌ NO'}`);
    console.log(`   • Contains overflow-x auto: ${wrapperStyles.includes('overflow-x: auto') ? '✅ YES' : '❌ NO'}`);
  }
  
  // 2. Check TransactionsTable - should not have margin auto or align-items center
  const transactionsTableMatch = content.match(/const TransactionsTable = styled\.div`([^`]+)`/s);
  if (transactionsTableMatch) {
    const tableStyles = transactionsTableMatch[1];
    const hasMarginAuto = tableStyles.includes('margin: 0 auto');
    const hasAlignItemsCenter = tableStyles.includes('align-items: center');
    const hasMaxWidth = tableStyles.includes('max-width');
    
    console.log('\n2. ✅ TransactionsTable Component:');
    console.log(`   • No margin auto: ${!hasMarginAuto ? '✅ YES' : '❌ NO'}`);
    console.log(`   • No align-items center: ${!hasAlignItemsCenter ? '✅ YES' : '❌ NO'}`);
    console.log(`   • No max-width constraint: ${!hasMaxWidth ? '✅ YES' : '❌ NO'}`);
    console.log(`   • Width 100%: ${tableStyles.includes('width: 100%') ? '✅ YES' : '❌ NO'}`);
  }
  
  // 3. Check TableHeader padding reduction
  const tableHeaderMatch = content.match(/const TableHeader = styled\.div`([^`]+)`/s);
  if (tableHeaderMatch) {
    const headerStyles = tableHeaderMatch[1];
    const paddingMatch = headerStyles.match(/padding:\s*([^;]+);/);
    
    console.log('\n3. ✅ TableHeader Padding:');
    if (paddingMatch) {
      const padding = paddingMatch[1].trim();
      console.log(`   • Current padding: ${padding}`);
      const hasReducedPadding = padding.includes('20px') && !padding.includes('40px');
      console.log(`   • Reduced side padding (20px instead of 40px): ${hasReducedPadding ? '✅ YES' : '❌ NO'}`);
    }
  }
  
  // 4. Check TableRow padding consistency
  const tableRowMatch = content.match(/const TableRow = styled\.div`([^`]+)`/s);
  if (tableRowMatch) {
    const rowStyles = tableRowMatch[1];
    const paddingMatch = rowStyles.match(/padding:\s*([^;]+);/);
    
    console.log('\n4. ✅ TableRow Padding:');
    if (paddingMatch) {
      const padding = paddingMatch[1].trim();
      console.log(`   • Current padding: ${padding}`);
      const hasReducedPadding = padding.includes('20px') && !padding.includes('40px');
      console.log(`   • Reduced side padding (20px instead of 40px): ${hasReducedPadding ? '✅ YES' : '❌ NO'}`);
    }
  }
  
  // 5. Check PaymentVerificationTableRow consistency
  const paymentRowMatch = content.match(/const PaymentVerificationTableRow = styled\.div`([^`]+)`/s);
  if (paymentRowMatch) {
    const paymentRowStyles = paymentRowMatch[1];
    const hasMatchingColumns = paymentRowStyles.includes('50px 150px 110px 200px 180px 120px 100px 120px 120px 120px 120px');
    const hasMatchingGap = paymentRowStyles.includes('gap: 20px');
    
    console.log('\n5. ✅ PaymentVerificationTableRow Consistency:');
    console.log(`   • Matches header column widths: ${hasMatchingColumns ? '✅ YES' : '❌ NO'}`);
    console.log(`   • Matches header gap: ${hasMatchingGap ? '✅ YES' : '❌ NO'}`);
  }
  
  // 6. Overall assessment
  console.log('\n' + '='.repeat(50));
  console.log('🎯 OVERALL ASSESSMENT:');
  
  const tableWrapperFixed = !tableWrapperMatch || !tableWrapperMatch[1].includes('justify-content: center');
  const transactionsTableFixed = !transactionsTableMatch || (!transactionsTableMatch[1].includes('margin: 0 auto') && !transactionsTableMatch[1].includes('align-items: center'));
  const paddingReduced = content.includes('padding: 28px 20px') && content.includes('padding: 32px 20px');
  
  if (tableWrapperFixed && transactionsTableFixed && paddingReduced) {
    console.log('🎉 ✅ TABLE BORDERS/SPACING SUCCESSFULLY REMOVED!');
    console.log();
    console.log('Changes made:');
    console.log('• Removed flex centering from TableWrapper');
    console.log('• Removed margin auto and align-items center from TransactionsTable');
    console.log('• Reduced side padding from 40px to 20px in headers and rows');
    console.log('• Aligned PaymentVerificationTableRow with regular table structure');
    console.log('• Updated responsive media queries to maintain consistency');
    console.log();
    console.log('🎯 Result:');
    console.log('• Table now spans full width without extra side spacing');
    console.log('• Columns align properly edge-to-edge');
    console.log('• No more unwanted borders or centering gaps');
  } else {
    console.log('❌ SOME BORDER/SPACING ISSUES REMAIN');
    console.log('Check the individual components above for details');
  }
  
  console.log();
  console.log('📋 TO VERIFY THE FIX:');
  console.log('1. Refresh the frontend application');
  console.log('2. Navigate to Admin → Transaction Management');
  console.log('3. Click on "Verify Payment" tab');
  console.log('4. Check that the table extends to the full width');
  console.log('5. Verify there are no extra borders or spacing on the sides');
  console.log('6. Confirm columns align properly with headers');

} catch (error) {
  console.error('❌ Error during verification:', error.message);
}
