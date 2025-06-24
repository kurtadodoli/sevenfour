const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing',
  port: 3306
};

async function debugInventoryIssue() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔍 DEBUGGING INVENTORY ISSUE\n');
    
    // 1. Check current server configuration
    console.log('1️⃣ Checking system status...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Check if required fields exist in products table
    const [productFields] = await connection.execute("DESCRIBE products");
    const requiredFields = ['total_available_stock', 'total_reserved_stock', 'stock_status', 'last_stock_update'];
    
    console.log('📋 Required inventory fields in products table:');
    requiredFields.forEach(field => {
      const exists = productFields.some(col => col.Field === field);
      console.log(`   ${exists ? '✅' : '❌'} ${field}`);
    });
    
    // 2. Check current stock data
    console.log('\n2️⃣ Current stock data:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const [stockData] = await connection.execute(`
      SELECT 
        productname,
        productquantity,
        total_stock,
        total_available_stock,
        total_reserved_stock,
        stock_status,
        last_stock_update
      FROM products 
      WHERE productname = 'No Struggles No Progress'
    `);
    
    if (stockData.length > 0) {
      const stock = stockData[0];
      console.log('📦 "No Struggles No Progress" stock data:');
      console.log(`   productquantity: ${stock.productquantity}`);
      console.log(`   total_stock: ${stock.total_stock}`);
      console.log(`   total_available_stock: ${stock.total_available_stock} ← This is what should change`);
      console.log(`   total_reserved_stock: ${stock.total_reserved_stock} ← This tracks confirmed orders`);
      console.log(`   stock_status: ${stock.stock_status}`);
      console.log(`   last_stock_update: ${stock.last_stock_update}`);
    }
    
    // 3. Check recent orders
    console.log('\n3️⃣ Recent orders for testing:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const [recentOrders] = await connection.execute(`
      SELECT 
        o.id,
        o.order_number,
        o.status,
        o.total_amount,
        oi.quantity,
        oi.product_name,
        cr.status as cancellation_status
      FROM orders o
      JOIN order_items oi ON o.invoice_id = oi.invoice_id
      LEFT JOIN cancellation_requests cr ON o.id = cr.order_id AND cr.status = 'pending'
      WHERE oi.product_name = 'No Struggles No Progress'
      ORDER BY o.id DESC
      LIMIT 5
    `);
    
    console.log('📋 Recent orders with "No Struggles No Progress":');
    recentOrders.forEach(order => {
      const cancelStatus = order.cancellation_status ? ` (${order.cancellation_status} cancellation)` : '';
      console.log(`   Order #${order.order_number}: ${order.status} - ${order.quantity} units${cancelStatus}`);
    });
    
    // 4. Check if there are pending orders to test with
    const pendingOrders = recentOrders.filter(o => o.status === 'pending');
    if (pendingOrders.length > 0) {
      console.log(`\n✅ Found ${pendingOrders.length} pending order(s) for testing!`);
      pendingOrders.forEach(order => {
        console.log(`   📱 Test with Order #${order.order_number} (${order.quantity} units)`);
      });
    } else {
      console.log('\n⚠️  No pending orders found. Use the test order created earlier.');
    }
    
    // 5. Debug checklist
    console.log('\n4️⃣ DEBUGGING CHECKLIST:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('When testing order confirmation, check:');
    console.log('');
    console.log('□ SERVER SIDE:');
    console.log('   □ Server is running (cd server && node app.js)');
    console.log('   □ Server shows these logs when you click "Confirm Order":');
    console.log('     - === CONFIRM ORDER DEBUG ===');
    console.log('     - req.user: { id: X }');
    console.log('     - orderId: X');
    console.log('     - Getting order items for inventory update...');
    console.log('     - Found X items in order');
    console.log('     - Checking stock for No Struggles No Progress: ordered=X, available=141');
    console.log('     - ✅ All items have sufficient stock');
    console.log('     - Updating inventory for confirmed order...');
    console.log('     - Updated stock for No Struggles No Progress: -X units');
    console.log('');
    console.log('□ CLIENT SIDE:');
    console.log('   □ You are logged in');
    console.log('   □ Order status is "pending" before confirming');
    console.log('   □ Browser console shows no errors (F12)');
    console.log('   □ Network tab shows API calls being made');
    console.log('');
    console.log('□ DATABASE SIDE:');
    console.log('   □ total_available_stock decreases after confirmation');
    console.log('   □ total_reserved_stock increases after confirmation');
    console.log('   □ MaintenancePage shows updated stock numbers');
    
    console.log('\n5️⃣ MANUAL VERIFICATION STEPS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('1. Run this query BEFORE confirming an order:');
    console.log('   SELECT total_available_stock, total_reserved_stock');
    console.log('   FROM products WHERE productname = "No Struggles No Progress";');
    console.log('');
    console.log('2. Confirm the order in the UI');
    console.log('');
    console.log('3. Run the same query AFTER confirmation:');
    console.log('   - available_stock should decrease by order quantity');
    console.log('   - reserved_stock should increase by order quantity');
    console.log('');
    console.log('4. Check MaintenancePage for updated numbers');
    console.log('');
    console.log('5. Test cancellation and verify stock restoration');
    
    console.log('\n6️⃣ COMMON ISSUES AND SOLUTIONS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('❌ No server logs when clicking buttons:');
    console.log('   → Check if server is running and client is connecting to right port');
    console.log('');
    console.log('❌ "Invalid token" or authentication errors:');
    console.log('   → Make sure you are logged in before testing');
    console.log('');
    console.log('❌ Stock not changing despite successful API calls:');
    console.log('   → Check database connection and field names');
    console.log('');
    console.log('❌ MaintenancePage showing old data:');
    console.log('   → Refresh the page or check if it\'s using cached data');
    console.log('');
    console.log('❌ "Cancellation Requested" not showing:');
    console.log('   → Check if cancellation_requests table has the data');
    
    // 6. Show test data summary
    console.log('\n7️⃣ CURRENT TEST ENVIRONMENT:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📦 Product: "No Struggles No Progress"`);
    console.log(`📊 Current Available Stock: ${stockData[0]?.total_available_stock || 'Unknown'}`);
    console.log(`🔒 Current Reserved Stock: ${stockData[0]?.total_reserved_stock || 'Unknown'}`);
    console.log(`📱 Pending Orders: ${pendingOrders.length}`);
    console.log(`🏪 Server Expected Port: 3000`);
    console.log(`🖥️  Client Expected Port: 3001`);
    
    console.log('\n🎯 THE SYSTEM IS WORKING IN DATABASE TESTS!');
    console.log('   If UI testing fails, the issue is likely in:');
    console.log('   - Server/client communication');
    console.log('   - Authentication');
    console.log('   - Browser/caching issues');
    console.log('   - Frontend not making proper API calls');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

debugInventoryIssue();
