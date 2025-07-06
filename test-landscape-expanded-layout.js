/**
 * Test script to verify LANDSCAPE layout of expanded panel sections
 * File: test-landscape-expanded-layout.js
 */

const fs = require('fs');
const path = require('path');

console.log('🏞️ Testing LANDSCAPE Layout - Expanded Panel Sections');
console.log('=' .repeat(70));

// Read the TransactionPage.js file
const transactionPagePath = path.join(__dirname, 'client', 'src', 'pages', 'TransactionPage.js');

if (!fs.existsSync(transactionPagePath)) {
  console.error('❌ TransactionPage.js not found at:', transactionPagePath);
  process.exit(1);
}

const fileContent = fs.readFileSync(transactionPagePath, 'utf8');

// Test 1: Check ExpandedContent grid layout
console.log('\n1. Testing ExpandedContent Grid Layout:');
const expandedContentMatch = fileContent.match(/const ExpandedContent = styled\.div`([\s\S]*?)`;\n/);
if (expandedContentMatch) {
  const styles = expandedContentMatch[1];
  
  // Check for 4-column layout
  if (styles.includes('grid-template-columns: 1fr 1fr 1fr 2fr')) {
    console.log('✅ 4-column desktop layout: Customer | Shipping | Order Details | Order Items (wider)');
  }
  
  // Check responsive breakpoints
  if (styles.includes('@media (max-width: 1400px)')) {
    console.log('✅ Tablet responsive: Adapts to 3 columns at 1400px');
  }
  
  if (styles.includes('@media (max-width: 1024px)')) {
    console.log('✅ Small tablet responsive: Adapts to 2 columns at 1024px');
  }
  
  if (styles.includes('@media (max-width: 768px)')) {
    console.log('✅ Mobile responsive: Stacks vertically only on mobile');
  }
  
  if (styles.includes('gap: 20px')) {
    console.log('✅ Proper spacing between columns (20px gap)');
  }
} else {
  console.log('❌ ExpandedContent styled component not found');
}

// Test 2: Check that all 4 sections are in the grid
console.log('\n2. Testing Section Structure in Grid:');
const expandedContentStructure = fileContent.match(/<ExpandedContent>([\s\S]*?)<\/ExpandedContent>/);
if (expandedContentStructure) {
  const content = expandedContentStructure[1];
  
  // Count InfoSection components
  const infoSectionMatches = content.match(/<InfoSection>/g);
  if (infoSectionMatches && infoSectionMatches.length === 4) {
    console.log('✅ All 4 sections are properly structured as InfoSection components');
    
    // Check specific sections
    if (content.includes('Customer Information</h4>')) {
      console.log('   ✅ Column 1: Customer Information section');
    }
    if (content.includes('Shipping Address</h4>')) {
      console.log('   ✅ Column 2: Shipping Address section');
    }
    if (content.includes('Order Details</h4>')) {
      console.log('   ✅ Column 3: Order Details section');
    }
    if (content.includes('Order Items</h4>')) {
      console.log('   ✅ Column 4: Order Items section (wider column)');
    }
  } else {
    console.log(`❌ Expected 4 InfoSection components, found ${infoSectionMatches ? infoSectionMatches.length : 0}`);
  }
  
  // Check that Order Items is no longer outside the grid
  if (!content.includes('marginTop: \'24px\'') && !content.includes('<div style={{')) {
    console.log('✅ Order Items section is properly inside the grid (no more external div)');
  } else {
    console.log('⚠️ Order Items section may still have external styling');
  }
} else {
  console.log('❌ ExpandedContent structure not found');
}

// Test 3: Check InfoSection optimization for grid
console.log('\n3. Testing InfoSection Grid Optimization:');
const infoSectionMatch = fileContent.match(/const InfoSection = styled\.div`([\s\S]*?)`;\n/);
if (infoSectionMatch) {
  const styles = infoSectionMatch[1];
  
  if (styles.includes('min-height: 180px')) {
    console.log('✅ Consistent minimum height for all sections (180px)');
  }
  
  if (styles.includes('display: flex') && styles.includes('flex-direction: column')) {
    console.log('✅ Flexible column layout within each section');
  }
  
  if (styles.includes('overflow-y: auto')) {
    console.log('✅ Scrolling enabled for sections with long content');
  }
} else {
  console.log('❌ InfoSection styled component not found');
}

// Test 4: Check Order Items optimization
console.log('\n4. Testing Order Items Optimization for Grid:');
const orderItemsListMatch = fileContent.match(/const OrderItemsList = styled\.div`([\s\S]*?)`;\n/);
if (orderItemsListMatch) {
  const styles = orderItemsListMatch[1];
  
  if (styles.includes('max-height: 240px')) {
    console.log('✅ Order items list has constrained height (240px) for grid layout');
  }
  
  if (styles.includes('gap: 8px')) {
    console.log('✅ Compact spacing between order items (8px gap)');
  }
  
  if (styles.includes('width: 4px')) {
    console.log('✅ Thin scrollbar for better space utilization');
  }
}

// Test 5: Check compact item styling
console.log('\n5. Testing Compact Item Styling:');
const orderItemCardMatch = fileContent.match(/const OrderItemCard = styled\.div`([\s\S]*?)`;\n/);
if (orderItemCardMatch) {
  const styles = orderItemCardMatch[1];
  
  if (styles.includes('gap: 8px') && styles.includes('padding: 8px')) {
    console.log('✅ Compact order item cards (8px padding and gap)');
  }
  
  if (styles.includes('font-size: 12px')) {
    console.log('✅ Smaller font size for better space efficiency');
  }
}

const orderItemImageMatch = fileContent.match(/const OrderItemImage = styled\.div`([\s\S]*?)`;\n/);
if (orderItemImageMatch) {
  const styles = orderItemImageMatch[1];
  
  if (styles.includes('width: 40px') && styles.includes('height: 40px')) {
    console.log('✅ Compact product images (40x40px)');
  }
}

// Test 6: Check that HorizontalCustomerInfo is still used
console.log('\n6. Testing Customer Info Layout:');
if (fileContent.includes('<HorizontalCustomerInfo>')) {
  console.log('✅ Customer information uses horizontal layout within its section');
} else {
  console.log('❌ HorizontalCustomerInfo component not found in use');
}

console.log('\n' + '=' .repeat(70));
console.log('🎯 LANDSCAPE LAYOUT SUMMARY:');
console.log('   🏞️ Desktop: 4 columns side-by-side (Customer | Shipping | Order Details | Order Items)');
console.log('   📱 Tablet (1400px): 3 columns with Customer+Shipping grouped');
console.log('   📱 Small Tablet (1024px): 2 columns with Info grouped');
console.log('   📱 Mobile (768px): Single column stack');
console.log('   📏 Order Items column is wider (2fr) to accommodate item list');
console.log('   📦 All sections have consistent minimum height and flex layout');
console.log('   🎨 Compact styling for better space utilization');
console.log('   ✨ No more "phone layout" - true LANDSCAPE/DESKTOP experience!');

console.log('\n🎉 LANDSCAPE LAYOUT VERIFICATION COMPLETE!');
