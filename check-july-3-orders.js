const db = require('./server/config/db');

async function checkJuly3Orders() {
  try {
    console.log('🔍 Checking orders scheduled for July 3, 2025...\n');

    // Check delivery schedules for July 3, 2025
    const schedules = await db.query(`
      SELECT * FROM delivery_schedules_enhanced 
      WHERE DATE(delivery_date) = '2025-07-03'
      ORDER BY delivery_date
    `);

    console.log(`📅 Delivery Schedules for July 3, 2025: ${schedules.length} found`);
    schedules.forEach((schedule, index) => {
      console.log(`  ${index + 1}. Schedule ID: ${schedule.id}`);
      console.log(`     Order ID: ${schedule.order_id}`);
      console.log(`     Order Number: ${schedule.order_number}`);
      console.log(`     Customer: ${schedule.customer_name}`);
      console.log(`     Delivery Status: ${schedule.delivery_status}`);
      console.log(`     Delivery Date: ${schedule.delivery_date}`);
      console.log('');
    });

    // Check orders with scheduled_delivery_date for July 3, 2025
    const orders = await db.query(`
      SELECT id, order_number, customer_name, order_type, delivery_status, scheduled_delivery_date
      FROM orders 
      WHERE DATE(scheduled_delivery_date) = '2025-07-03'
      ORDER BY scheduled_delivery_date
    `);

    console.log(`📦 Orders with scheduled_delivery_date = July 3, 2025: ${orders.length} found`);
    orders.forEach((order, index) => {
      console.log(`  ${index + 1}. Order ID: ${order.id}`);
      console.log(`     Order Number: ${order.order_number}`);
      console.log(`     Customer: ${order.customer_name}`);
      console.log(`     Order Type: ${order.order_type}`);
      console.log(`     Delivery Status: ${order.delivery_status}`);
      console.log(`     Scheduled Date: ${order.scheduled_delivery_date}`);
      console.log('');
    });

    // Check custom orders for July 3, 2025
    const customOrders = await db.query(`
      SELECT co.id, co.custom_order_id, co.customer_name, co.delivery_status, co.estimated_delivery_date
      FROM custom_orders co
      WHERE DATE(co.estimated_delivery_date) = '2025-07-03'
      ORDER BY co.estimated_delivery_date
    `);

    console.log(`🎨 Custom Orders with estimated_delivery_date = July 3, 2025: ${customOrders.length} found`);
    customOrders.forEach((order, index) => {
      console.log(`  ${index + 1}. Custom Order ID: ${order.id}`);
      console.log(`     Order Number: ${order.custom_order_id}`);
      console.log(`     Customer: ${order.customer_name}`);
      console.log(`     Delivery Status: ${order.delivery_status}`);
      console.log(`     Estimated Date: ${order.estimated_delivery_date}`);
      console.log('');
    });

    console.log('📊 SUMMARY:');
    console.log(`  - Delivery Schedules: ${schedules.length}`);
    console.log(`  - Regular Orders: ${orders.length}`);
    console.log(`  - Custom Orders: ${customOrders.length}`);
    console.log(`  - TOTAL: ${schedules.length + orders.length + customOrders.length}`);

  } catch (error) {
    console.error('Error:', error);
  }
}

checkJuly3Orders();
