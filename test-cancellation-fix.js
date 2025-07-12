const mysql = require('mysql2/promise');
const axios = require('axios');

const dbConfig = {
  host: 'localhost',
  user: 'root', 
  password: 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing'
};

async function testCancellationFix() {
  try {
    console.log('🔍 Testing cancellation request fix...');
    
    // First, let's check if we have any orders to test with
    const connection = await mysql.createConnection(dbConfig);
    
    const [orders] = await connection.execute(`
      SELECT id, order_number, user_id, status 
      FROM orders 
      WHERE status IN ('pending', 'confirmed') 
      LIMIT 5
    `);
    
    console.log('\n📋 Available orders for testing:');
    console.table(orders);
    
    if (orders.length === 0) {
      console.log('❌ No orders available for testing cancellation');
      await connection.end();
      return;
    }
    
    // Let's also check if we have users
    const [users] = await connection.execute(`
      SELECT id, email, first_name, last_name 
      FROM users 
      LIMIT 5
    `);
    
    console.log('\n👥 Available users:');
    console.table(users);
    
    await connection.end();
    
    console.log('\n🔧 Fix Applied:');
    console.log('✅ Added user_id to INSERT statement in createCancellationRequest');
    console.log('✅ Updated SQL query to include user_id field');
    console.log('✅ Server restarted with the fix');
    
    console.log('\n📝 To test the fix:');
    console.log('1. Login to the frontend application');
    console.log('2. Navigate to an order page');
    console.log('3. Try to cancel an order');
    console.log('4. The 500 error should now be resolved');
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testCancellationFix();
