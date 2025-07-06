/**
 * Simple Frontend Code Verification
 * Checks that the frontend code has the correct logic for custom orders
 */

const fs = require('fs');
const path = require('path');

function verifyFrontendCode() {
  console.log('🔍 Verifying Frontend Code for Custom Order Fix...\n');

  const orderPagePath = path.join(__dirname, 'client', 'src', 'pages', 'OrderPage.js');
  
  if (!fs.existsSync(orderPagePath)) {
    console.log('❌ OrderPage.js not found at expected location');
    return;
  }

  const content = fs.readFileSync(orderPagePath, 'utf8');
  
  // Check for fetchOrderItems fix
  const hasFetchItemsFix = content.includes('if (typeof orderId === \'string\' && orderId.startsWith(\'custom-\'))') &&
                          content.includes('Skipping items fetch for custom order');
  
  // Check for viewInvoice fix
  const hasViewInvoiceFix = content.includes('if (order.order_type === \'custom\' || (typeof order.id === \'string\' && order.id.startsWith(\'custom-\')))') &&
                           content.includes('Use items already included in custom order');
  
  console.log('📋 Frontend Code Verification Results:');
  console.log(`   ✅ fetchOrderItems fix: ${hasFetchItemsFix ? 'PRESENT' : 'MISSING'}`);
  console.log(`   ✅ viewInvoice fix: ${hasViewInvoiceFix ? 'PRESENT' : 'MISSING'}`);
  
  if (hasFetchItemsFix && hasViewInvoiceFix) {
    console.log('\n🎉 All fixes are present in the frontend code!');
    console.log('\n📱 User Instructions:');
    console.log('1. Open your browser and go to: http://localhost:3000');
    console.log('2. Clear browser cache (Ctrl+Shift+R or hard refresh)');
    console.log('3. Try opening in an incognito/private window to bypass cache');
    console.log('4. Log in and navigate to "My Orders"');
    console.log('5. Click "View Invoice" on any custom order');
    console.log('6. The invoice should now load without 404 errors');
    
    console.log('\n🐛 If you still see errors:');
    console.log('- Open browser Developer Tools (F12)');
    console.log('- Go to the Console tab');
    console.log('- Look for log messages starting with 🎨');
    console.log('- These should show "Skipping items fetch for custom order"');
    console.log('- If you don\'t see these messages, the browser is still using cached code');
    
    console.log('\n🔄 Cache clearing options:');
    console.log('- Chrome: Ctrl+Shift+Delete → Clear browsing data');
    console.log('- Firefox: Ctrl+Shift+Delete → Clear recent history');
    console.log('- Edge: Ctrl+Shift+Delete → Clear browsing data');
    console.log('- Or use incognito/private browsing mode');
    
  } else {
    console.log('\n❌ Some fixes are missing from the frontend code');
    console.log('The browser cache is not the issue - the code needs to be updated');
  }
}

verifyFrontendCode();
