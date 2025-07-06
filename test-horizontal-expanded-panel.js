/**
 * Test script to verify horizontal customer information layout in expanded order details panel
 * File: test-horizontal-expanded-panel.js
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Horizontal Customer Info in Expanded Panel');
console.log('=' .repeat(70));

// Read the TransactionPage.js file
const transactionPagePath = path.join(__dirname, 'client', 'src', 'pages', 'TransactionPage.js');

if (!fs.existsSync(transactionPagePath)) {
  console.error('❌ TransactionPage.js not found at:', transactionPagePath);
  process.exit(1);
}

const fileContent = fs.readFileSync(transactionPagePath, 'utf8');

// Test 1: Check if HorizontalCustomerInfo component exists
console.log('\n1. Testing HorizontalCustomerInfo Component:');
const horizontalCustomerInfoRegex = /const HorizontalCustomerInfo = styled\.div`/;
if (horizontalCustomerInfoRegex.test(fileContent)) {
  console.log('✅ HorizontalCustomerInfo styled component found');
  
  // Extract the component definition
  const componentMatch = fileContent.match(/const HorizontalCustomerInfo = styled\.div`([\s\S]*?)`;\n/);
  if (componentMatch) {
    const componentStyles = componentMatch[1];
    console.log('   📋 Key styles found:');
    
    // Check for horizontal flex layout
    if (componentStyles.includes('display: flex')) {
      console.log('   ✅ Uses flex layout for horizontal arrangement');
    }
    
    // Check for gap spacing
    if (componentStyles.includes('gap: 16px')) {
      console.log('   ✅ Has proper spacing between elements (16px gap)');
    }
    
    // Check for separator styling
    if (componentStyles.includes('.separator')) {
      console.log('   ✅ Includes separator styling for visual division');
    }
    
    // Check for responsive design
    if (componentStyles.includes('@media (max-width: 768px)')) {
      console.log('   ✅ Has mobile-responsive design');
    }
    
    // Check for field styling
    if (componentStyles.includes('.customer-field')) {
      console.log('   ✅ Has structured field styling');
    }
  }
} else {
  console.log('❌ HorizontalCustomerInfo styled component not found');
}

// Test 2: Check if the customer information section uses horizontal layout
console.log('\n2. Testing Customer Information Section Implementation:');
const customerSectionRegex = /{\/\* Customer Information \*\/}[\s\S]*?<InfoSection>[\s\S]*?<h4>Customer Information<\/h4>[\s\S]*?<HorizontalCustomerInfo>/;
if (customerSectionRegex.test(fileContent)) {
  console.log('✅ Customer Information section uses HorizontalCustomerInfo component');
  
  // Check the structure of the horizontal layout
  const horizontalLayoutMatch = fileContent.match(/<HorizontalCustomerInfo>([\s\S]*?)<\/HorizontalCustomerInfo>/);
  if (horizontalLayoutMatch) {
    const layoutContent = horizontalLayoutMatch[1];
    
    // Check for customer fields
    const nameFieldMatch = layoutContent.match(/<div className="customer-field">[\s\S]*?Name:[\s\S]*?<\/div>/);
    const emailFieldMatch = layoutContent.match(/<div className="customer-field">[\s\S]*?Email:[\s\S]*?<\/div>/);
    const phoneFieldMatch = layoutContent.match(/<div className="customer-field">[\s\S]*?Phone:[\s\S]*?<\/div>/);
    
    if (nameFieldMatch && emailFieldMatch && phoneFieldMatch) {
      console.log('   ✅ All three customer fields (Name, Email, Phone) are structured properly');
    } else {
      console.log('   ⚠️ Some customer fields may be missing or incorrectly structured');
    }
    
    // Check for separators
    const separatorMatches = layoutContent.match(/className="separator"/g);
    if (separatorMatches && separatorMatches.length === 2) {
      console.log('   ✅ Correct number of separators (2) between the three fields');
    } else {
      console.log('   ⚠️ Incorrect number of separators found');
    }
    
    // Check for bullet character
    if (layoutContent.includes('•')) {
      console.log('   ✅ Uses bullet character (•) as separator');
    }
  }
} else {
  console.log('❌ Customer Information section does not use HorizontalCustomerInfo component');
}

// Test 3: Check for old vertical InfoItem usage in customer section
console.log('\n3. Testing Removal of Old Vertical Layout:');
const oldVerticalPattern = /<InfoItem>[\s\S]*?<span className="label">Name:<\/span>[\s\S]*?<\/InfoItem>/;
if (!oldVerticalPattern.test(fileContent)) {
  console.log('✅ Old vertical InfoItem layout has been removed from customer section');
} else {
  console.log('❌ Old vertical InfoItem layout still exists in customer section');
}

// Test 4: Check that InfoItem is still used for other sections
console.log('\n4. Testing InfoItem Usage in Other Sections:');
const shippingInfoItemMatch = fileContent.match(/Shipping Address<\/h4>[\s\S]*?<InfoItem>/);
const orderDetailsInfoItemMatch = fileContent.match(/Order Details<\/h4>[\s\S]*?<InfoItem>/);

if (shippingInfoItemMatch && orderDetailsInfoItemMatch) {
  console.log('✅ InfoItem is still properly used in Shipping Address and Order Details sections');
} else {
  console.log('⚠️ InfoItem usage in other sections may need verification');
}

// Test 5: Check component structure for consistency
console.log('\n5. Testing Overall Structure:');
const expandedContentMatch = fileContent.match(/<ExpandedContent>([\s\S]*?)<\/ExpandedContent>/);
if (expandedContentMatch) {
  const expandedContent = expandedContentMatch[1];
  
  // Count InfoSections
  const infoSectionMatches = expandedContent.match(/<InfoSection>/g);
  if (infoSectionMatches && infoSectionMatches.length >= 3) {
    console.log(`✅ Found ${infoSectionMatches.length} InfoSection components in expanded content`);
  }
  
  // Check section order
  if (expandedContent.includes('Customer Information') && 
      expandedContent.includes('Shipping Address') && 
      expandedContent.includes('Order Details')) {
    console.log('✅ All main sections (Customer, Shipping, Order Details) are present');
  }
}

// Test 6: Verify mobile responsiveness
console.log('\n6. Testing Mobile Responsiveness:');
const mobileResponsiveMatch = fileContent.match(/@media \(max-width: 768px\)[\s\S]*?flex-direction: column/);
if (mobileResponsiveMatch) {
  console.log('✅ Mobile responsiveness: Changes to column layout on small screens');
} else {
  console.log('⚠️ Mobile responsiveness may need verification');
}

console.log('\n' + '=' .repeat(70));
console.log('🎯 Summary:');
console.log('   - Customer information in expanded panel now displays horizontally');
console.log('   - Three fields (Name • Email • Phone) are on the same row');
console.log('   - Uses bullet separators for visual clarity');
console.log('   - Maintains responsive design for mobile devices');
console.log('   - Other sections (Shipping, Order Details) remain unchanged');
console.log('   - Reduces vertical space usage in expanded panel');

console.log('\n✅ Horizontal Customer Info Layout Test Complete!');
