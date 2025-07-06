/**
 * Debug Transaction Data Structure
 * This script helps identify what fields are actually available in transaction data
 * File: debug-transaction-data.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 TRANSACTION DATA STRUCTURE DEBUG');
console.log('=' .repeat(60));

// Read the TransactionPage.js file to see the data fetching
const transactionPagePath = path.join(__dirname, 'client', 'src', 'pages', 'TransactionPage.js');

if (!fs.existsSync(transactionPagePath)) {
  console.error('❌ TransactionPage.js not found');
  process.exit(1);
}

const fileContent = fs.readFileSync(transactionPagePath, 'utf8');

console.log('\n📊 CURRENT FIELD MAPPINGS IN TRANSACTIONPAGE.JS:');

// Extract field mappings from the expanded content section
const customerInfoMatch = fileContent.match(/Customer Information<\/h4>([\s\S]*?)InfoSection>/);
const shippingAddressMatch = fileContent.match(/Shipping Address<\/h4>([\s\S]*?)InfoSection>/);

console.log('\n👤 CUSTOMER INFORMATION FIELDS:');
if (customerInfoMatch) {
  const customerContent = customerInfoMatch[1];
  
  // Extract phone field mapping
  const phoneMatch = customerContent.match(/Phone:<\/span>[\s\S]*?\{([^}]+)\}/);
  if (phoneMatch) {
    console.log(`   📞 Phone: ${phoneMatch[1].trim()}`);
  }
  
  // Extract name field mapping  
  const nameMatch = customerContent.match(/Name:<\/span>[\s\S]*?\{([^}]+)\}/);
  if (nameMatch) {
    console.log(`   👤 Name: ${nameMatch[1].trim()}`);
  }
  
  // Extract email field mapping
  const emailMatch = customerContent.match(/Email:<\/span>[\s\S]*?\{([^}]+)\}/);
  if (emailMatch) {
    console.log(`   ✉️ Email: ${emailMatch[1].trim()}`);
  }
}

console.log('\n🏠 SHIPPING ADDRESS FIELDS:');
if (shippingAddressMatch) {
  const shippingContent = shippingAddressMatch[1];
  
  // Extract address field mappings
  const streetMatch = shippingContent.match(/Street:<\/span>[\s\S]*?\{([^}]+)\}/);
  if (streetMatch) {
    console.log(`   🏠 Street: ${streetMatch[1].trim()}`);
  }
  
  const cityMatch = shippingContent.match(/City:<\/span>[\s\S]*?\{([^}]+)\}/);
  if (cityMatch) {
    console.log(`   🏙️ City: ${cityMatch[1].trim()}`);
  }
  
  const provinceMatch = shippingContent.match(/Province:<\/span>[\s\S]*?\{([^}]+)\}/);
  if (provinceMatch) {
    console.log(`   🗺️ Province: ${provinceMatch[1].trim()}`);
  }
  
  const zipMatch = shippingContent.match(/ZIP Code:<\/span>[\s\S]*?\{([^}]+)\}/);
  if (zipMatch) {
    console.log(`   📮 ZIP Code: ${zipMatch[1].trim()}`);
  }
}

console.log('\n🔧 RECENT FIXES APPLIED:');
console.log('   ✅ Phone field priority: contact_phone checked FIRST');
console.log('   ✅ City field: city_municipality checked FIRST');
console.log('   ✅ ZIP field: zip_code checked FIRST');

console.log('\n📝 FIELD MAPPING SUMMARY:');
console.log('┌─────────────────┬─────────────────────────────────────────┐');
console.log('│ Display Field   │ Database Field Priority                 │');
console.log('├─────────────────┼─────────────────────────────────────────┤');
console.log('│ Customer Name   │ customer_name || first_name + last_name │');
console.log('│ Customer Email  │ customer_email || user_email            │');
console.log('│ Customer Phone  │ contact_phone || customer_phone         │');
console.log('│ Street Address  │ street_address || shipping_address      │');
console.log('│ City            │ city_municipality || city               │');
console.log('│ Province        │ province                                │');
console.log('│ ZIP Code        │ zip_code || postal_code                 │');
console.log('└─────────────────┴─────────────────────────────────────────┘');

console.log('\n🚀 TO VERIFY THE FIX:');
console.log('1. Create a test order with real user data');
console.log('2. Check the expanded panel in TransactionPage');
console.log('3. Verify that phone, city, province, ZIP show actual values');
console.log('4. If still showing N/A, check backend database schema');

console.log('\n💡 DEBUGGING TIPS:');
console.log('• Add console.log(transaction) in TransactionPage to see raw data');
console.log('• Check browser Network tab to see API response structure');
console.log('• Verify backend sends correct field names');
console.log('• Test with a fresh order to confirm data flow');

console.log('\n✨ Expected Result: No more N/A for user-inputted data!');
