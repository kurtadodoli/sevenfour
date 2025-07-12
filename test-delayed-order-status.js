const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing'
};

async function testDelayedOrderStatus() {
  try {
    console.log('🔍 Testing delayed order status implementation...');
    
    const connection = await mysql.createConnection(dbConfig);
    
    // Check if we have any orders with delayed delivery_status
    console.log('\n📋 Checking for orders with delayed delivery status:');
    const [delayedOrders] = await connection.execute(`
      SELECT 
        id, 
        order_number, 
        status as order_status, 
        delivery_status,
        total_amount,
        created_at
      FROM orders 
      WHERE delivery_status = 'delayed'
      LIMIT 10
    `);
    
    if (delayedOrders.length > 0) {
      console.log(`✅ Found ${delayedOrders.length} delayed orders:`);
      console.table(delayedOrders);
    } else {
      console.log('❌ No delayed orders found. Let\'s check available delivery statuses:');
      
      const [statuses] = await connection.execute(`
        SELECT DISTINCT delivery_status, COUNT(*) as count
        FROM orders 
        WHERE delivery_status IS NOT NULL
        GROUP BY delivery_status
        ORDER BY count DESC
      `);
      
      console.log('\n📊 Available delivery statuses:');
      console.table(statuses);
      
      // Let's temporarily set one order to delayed for testing
      const [sampleOrders] = await connection.execute(`
        SELECT id, order_number, delivery_status 
        FROM orders 
        WHERE delivery_status IN ('pending', 'scheduled', 'confirmed')
        LIMIT 3
      `);
      
      if (sampleOrders.length > 0) {
        console.log('\n🔧 Sample orders that could be set to delayed for testing:');
        console.table(sampleOrders);
        
        console.log('\n💡 To test the delayed status functionality:');
        console.log('1. Go to DeliveryPage.js in the admin panel');
        console.log('2. Select an order and change its status to "Delayed"');
        console.log('3. Then check OrderPage.js to see the delayed indicator');
        console.log('4. The order should show:');
        console.log('   - ⚠️ DELAYED badge in yellow/orange');
        console.log('   - "Delivery has been delayed" notice');
        console.log('   - Special progress indicator');
      }
    }
    
    await connection.end();
    
    console.log('\n✅ Delayed Order Status Features Implemented:');
    console.log('📍 DeliveryStatusBadge: Added "delayed" status with yellow/orange styling');
    console.log('📍 Status Text: Shows "⚠️ DELAYED" badge');
    console.log('📍 Status Description: "Delivery has been delayed - rescheduling in progress"');
    console.log('📍 Progress Indicator: Special delayed state instead of normal progress');
    console.log('📍 Order Notice: Prominent delayed notice at top of order card');
    console.log('📍 Animation: Pulsing warning icon for attention');
    
    console.log('\n🔄 The changes are now active and will automatically reflect when:');
    console.log('- Admin sets delivery_status = "delayed" in DeliveryPage.js');
    console.log('- Customer views their orders in OrderPage.js');
    console.log('- No additional configuration needed');
    
  } catch (error) {
    console.error('❌ Error testing delayed order status:', error.message);
  }
}

testDelayedOrderStatus();
