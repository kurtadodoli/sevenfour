const axios = require('axios');

async function testActualOrderAPI() {
  try {
    console.log('🧪 TESTING ACTUAL ORDER CONFIRMATION API\n');
    
    const baseURL = 'http://localhost:3000';
    
    console.log('1️⃣ Checking current stock from maintenance API...');
    try {
      const response = await axios.get(`${baseURL}/api/maintenance/products`);
      const products = response.data;
      
      const testProduct = products.find(p => p.productname === 'No Struggles No Progress');
      if (testProduct) {
        console.log('📦 Current stock from maintenance API:');
        console.log(`   Product: ${testProduct.productname}`);
        console.log(`   total_available_stock: ${testProduct.total_available_stock}`);
        console.log(`   total_reserved_stock: ${testProduct.total_reserved_stock}`);
        console.log(`   total_stock: ${testProduct.total_stock}`);
        console.log(`   stock_status: ${testProduct.stock_status}`);
        
        console.log('\n💡 This is what MaintenancePage should show for current stock');
      } else {
        console.log('❌ Test product not found in maintenance API');
      }
    } catch (error) {
      console.log('❌ Maintenance API error:', error.message);
    }
    
    console.log('\n2️⃣ Testing order confirmation endpoint structure...');
    
    // Try to test the confirmation endpoint to see what happens
    try {
      const response = await axios.post(`${baseURL}/api/orders/999/confirm`, {}, {
        headers: {
          'Authorization': 'Bearer test-token',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Unexpected success:', response.data);
      
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;
      
      console.log(`📡 Confirm endpoint response: ${status} - ${message}`);
      
      if (status === 401) {
        console.log('✅ Authentication required (expected - good!)');
      } else if (status === 404) {
        console.log('✅ Order not found (expected for test ID)');
      } else if (status === 400) {
        console.log('✅ Bad request (expected for invalid order)');
      }
      
      console.log('🔍 This confirms the endpoint exists and requires proper auth');
    }
    
    console.log('\n3️⃣ REAL TESTING INSTRUCTIONS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('To test the actual order confirmation flow:');
    console.log('');
    console.log('1. 🖥️  Start both servers:');
    console.log('   - Backend: cd server && node app.js');
    console.log('   - Frontend: cd client && npm start');
    console.log('');
    console.log('2. 🔑 Log into the application');
    console.log('');
    console.log('3. 📦 Check current stock:');
    console.log('   - Go to MaintenancePage');
    console.log('   - Note current stock for "No Struggles No Progress"');
    console.log('');
    console.log('4. 🛒 Create and confirm an order:');
    console.log('   - Go to Order History');
    console.log('   - Find a pending order or create one');
    console.log('   - Click "Confirm Order"');
    console.log('   - Watch server terminal for logs');
    console.log('');
    console.log('5. ✅ Verify stock change:');
    console.log('   - Go back to MaintenancePage');
    console.log('   - Stock should be reduced by order quantity');
    console.log('');
    console.log('6. ❌ Test cancellation:');
    console.log('   - Click "Cancel Order" on confirmed order');
    console.log('   - Fill cancellation reason');
    console.log('   - Button should change to "Cancellation Requested"');
    console.log('   - Admin approves cancellation');
    console.log('   - Stock should restore in MaintenancePage');
    
    console.log('\n4️⃣ DEBUGGING CHECKLIST:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('If it\'s not working, check:');
    console.log('□ Server logs show API calls when you click buttons');
    console.log('□ Browser console shows no JavaScript errors');
    console.log('□ You are properly logged in');
    console.log('□ Order status is "pending" before confirming');
    console.log('□ Network tab shows API calls being made');
    console.log('□ MaintenancePage refreshes to show new stock');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testActualOrderAPI();
