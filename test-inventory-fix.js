// Simple verification test for the inventory fix
const axios = require('axios');

async function testInventoryFix() {
  console.log('🧪 Testing Inventory Fix');
  console.log('='*40);
  
  try {
    // Test the maintenance endpoint (this is what shows stock numbers in UI)
    console.log('\n1️⃣ Testing maintenance products endpoint...');
    const response = await axios.get('http://localhost:3001/api/maintenance/products');
    
    if (response.data) {
      console.log(`✅ Found ${response.data.length} products`);
      
      // Find "No Struggles No Progress" product
      const testProduct = response.data.find(p => p.productname === 'No Struggles No Progress');
      
      if (testProduct) {
        console.log('\n📦 "No Struggles No Progress" Product Data:');
        console.log(`  Product ID: ${testProduct.product_id}`);
        console.log(`  productquantity: ${testProduct.productquantity}`);
        console.log(`  total_available_stock: ${testProduct.total_available_stock}`);
        console.log(`  total_reserved_stock: ${testProduct.total_reserved_stock}`);
        console.log(`  displayStock: ${testProduct.displayStock}`);
        console.log(`  totalStock: ${testProduct.totalStock}`);
        console.log(`  stock_status: ${testProduct.stock_status}`);
        
        if (testProduct.total_available_stock && testProduct.total_available_stock > 0) {
          console.log('✅ Product has available stock for testing order confirmation');
        } else {
          console.log('⚠️ Product has no available stock - need to fix data first');
        }
      } else {
        console.log('❌ "No Struggles No Progress" product not found');
      }
    } else {
      console.log('❌ No response data received');
    }
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Run the fix script: node fix-inventory-display-issue.js');
    console.log('2. Restart the server if needed');
    console.log('3. Test order confirmation in the UI');
    console.log('4. Watch stock numbers decrease when confirming orders');
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Server is not running on port 3001');
      console.log('Start the server first: cd server && node app.js');
    } else {
      console.log('❌ Error:', error.message);
    }
  }
}

testInventoryFix();
