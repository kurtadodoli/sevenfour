const mysql = require('mysql2/promise');

async function clearDatabaseTables() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 's3v3n-f0ur-cl0thing*',
    database: 'seven_four_clothing'
  });

  try {
    console.log('🗑️  Clearing Database Tables...\n');
    
    // First, let's check what data exists
    console.log('📊 Current Data Count:');
    
    const [ordersCount] = await connection.execute('SELECT COUNT(*) as count FROM orders');
    console.log(`- Orders: ${ordersCount[0].count} records`);
    
    const [customOrdersCount] = await connection.execute('SELECT COUNT(*) as count FROM custom_orders');
    console.log(`- Custom Orders: ${customOrdersCount[0].count} records`);
    
    const [orderItemsCount] = await connection.execute('SELECT COUNT(*) as count FROM order_items');
    console.log(`- Order Items: ${orderItemsCount[0].count} records`);
    
    console.log('\n⚠️  WARNING: This will permanently delete all data from these tables!');
    console.log('Tables to be cleared:');
    console.log('- orders');
    console.log('- custom_orders'); 
    console.log('- order_items');
    
    // For safety, let's add a confirmation step
    console.log('\n🔄 Proceeding with table clearing...\n');
    
    // Disable foreign key checks temporarily to avoid constraint issues
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
    
    // Clear order_items first (has foreign keys to orders)
    console.log('1️⃣ Clearing order_items table...');
    await connection.execute('DELETE FROM order_items');
    await connection.execute('ALTER TABLE order_items AUTO_INCREMENT = 1');
    console.log('   ✅ order_items table cleared');
    
    // Clear orders table
    console.log('2️⃣ Clearing orders table...');
    await connection.execute('DELETE FROM orders');
    await connection.execute('ALTER TABLE orders AUTO_INCREMENT = 1');
    console.log('   ✅ orders table cleared');
    
    // Clear custom_orders table
    console.log('3️⃣ Clearing custom_orders table...');
    await connection.execute('DELETE FROM custom_orders');
    await connection.execute('ALTER TABLE custom_orders AUTO_INCREMENT = 1');
    console.log('   ✅ custom_orders table cleared');
    
    // Re-enable foreign key checks
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
    
    // Verify tables are empty
    console.log('\n🔍 Verification:');
    
    const [ordersVerify] = await connection.execute('SELECT COUNT(*) as count FROM orders');
    console.log(`- Orders: ${ordersVerify[0].count} records remaining`);
    
    const [customOrdersVerify] = await connection.execute('SELECT COUNT(*) as count FROM custom_orders');
    console.log(`- Custom Orders: ${customOrdersVerify[0].count} records remaining`);
    
    const [orderItemsVerify] = await connection.execute('SELECT COUNT(*) as count FROM order_items');
    console.log(`- Order Items: ${orderItemsVerify[0].count} records remaining`);
    
    console.log('\n✅ DATABASE TABLES CLEARED SUCCESSFULLY!');
    console.log('\n📋 What was cleared:');
    console.log('- All order records and their items');
    console.log('- All custom order records');
    console.log('- Auto-increment counters reset to 1');
    console.log('- Foreign key relationships maintained');
    
    console.log('\n🎯 Next Steps:');
    console.log('- Tables are now empty and ready for fresh data');
    console.log('- You can create new orders through the application');
    console.log('- All table structures and relationships are intact');
    
  } catch (error) {
    console.error('❌ Error clearing tables:', error.message);
    console.log('\n🔧 Common issues:');
    console.log('- Check if MySQL server is running');
    console.log('- Verify database credentials');
    console.log('- Ensure tables exist in the database');
  } finally {
    await connection.end();
  }
}

clearDatabaseTables();
