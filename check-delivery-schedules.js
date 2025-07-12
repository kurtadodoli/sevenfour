const mysql = require('mysql2/promise');

async function checkDeliverySchedules() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root', 
      password: 's3v3n-f0ur-cl0thing*',
      database: 'seven_four_clothing'
    });

    console.log('🔍 Checking delivery schedules...');
    
    // Check all delivery schedules
    const [allSchedules] = await connection.execute(
      'SELECT * FROM delivery_schedules ORDER BY delivery_date'
    );
    
    console.log(`📅 Total delivery schedules: ${allSchedules.length}`);
    
    if (allSchedules.length > 0) {
      console.log('\n📋 All delivery schedules:');
      allSchedules.forEach(schedule => {
        console.log(`  - ${schedule.delivery_date}: ${schedule.order_number} (${schedule.courier_name})`);
      });
    }
    
    // Check orders table for delivery-related dates
    console.log('\n🔍 Checking orders table for delivery dates...');
    const [orders] = await connection.execute(
      'SELECT order_number, delivery_date, scheduled_delivery_date, created_at, status FROM orders WHERE delivery_date IS NOT NULL OR scheduled_delivery_date IS NOT NULL ORDER BY created_at DESC'
    );
    
    console.log(`📦 Orders with delivery dates: ${orders.length}`);
    orders.forEach(order => {
      console.log(`  - ${order.order_number}: delivery_date=${order.delivery_date}, scheduled=${order.scheduled_delivery_date}, status=${order.status}`);
    });
    
    // Check custom_orders table for delivery dates
    console.log('\n🔍 Checking custom_orders table...');
    const [customOrders] = await connection.execute(
      'SELECT order_number, delivery_date, scheduled_delivery_date, created_at, status FROM custom_orders WHERE delivery_date IS NOT NULL OR scheduled_delivery_date IS NOT NULL ORDER BY created_at DESC'
    );
    
    console.log(`🎨 Custom orders with delivery dates: ${customOrders.length}`);
    customOrders.forEach(order => {
      console.log(`  - ${order.order_number}: delivery_date=${order.delivery_date}, scheduled=${order.scheduled_delivery_date}, status=${order.status}`);
    });
    
    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkDeliverySchedules();
