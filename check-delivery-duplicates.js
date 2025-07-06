// Check for duplicate delivery schedules causing duplicate orders
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing',
  port: 3306
};

async function checkDuplicateDeliverySchedules() {
  let connection;
  
  try {
    console.log('🔍 Checking for duplicate delivery schedules...');
    connection = await mysql.createConnection(dbConfig);
    
    // Check for duplicate delivery schedules
    console.log('\n📅 Checking delivery_schedules_enhanced table for duplicates...');
    const [schedules] = await connection.execute(`
      SELECT order_number, order_type, COUNT(*) as count
      FROM delivery_schedules_enhanced 
      GROUP BY order_number, order_type
      HAVING COUNT(*) > 1
    `);
    
    if (schedules.length > 0) {
      console.log(`❌ Found ${schedules.length} order(s) with duplicate delivery schedules:`);
      schedules.forEach(schedule => {
        console.log(`  ${schedule.order_number} (${schedule.order_type}): ${schedule.count} schedules`);
      });
      
      // Get details of the duplicates
      for (const schedule of schedules) {
        console.log(`\n🔍 Details for ${schedule.order_number}:`);
        const [details] = await connection.execute(`
          SELECT id, order_id, order_number, order_type, delivery_date, delivery_status, created_at
          FROM delivery_schedules_enhanced 
          WHERE order_number = ? AND order_type = ?
          ORDER BY created_at
        `, [schedule.order_number, schedule.order_type]);
        
        details.forEach((detail, index) => {
          console.log(`    Schedule ${index + 1}: ID=${detail.id}, Date=${detail.delivery_date}, Status=${detail.delivery_status}, Created=${detail.created_at}`);
        });
      }
    } else {
      console.log('✅ No duplicate delivery schedules found');
    }
    
    // Check the specific custom order that's duplicating
    console.log('\n🎨 Checking specific custom order CUSTOM-MCNQQ7NW-GQEOI...');
    const [customOrderSchedules] = await connection.execute(`
      SELECT id, order_id, order_number, order_type, delivery_date, delivery_status, created_at
      FROM delivery_schedules_enhanced 
      WHERE order_number = 'CUSTOM-MCNQQ7NW-GQEOI'
    `);
    
    console.log(`Found ${customOrderSchedules.length} delivery schedule(s) for CUSTOM-MCNQQ7NW-GQEOI:`);
    customOrderSchedules.forEach((schedule, index) => {
      console.log(`  Schedule ${index + 1}: ID=${schedule.id}, OrderID=${schedule.order_id}, Date=${schedule.delivery_date}, Status=${schedule.delivery_status}`);
    });
    
    // Check if the issue might be in the custom_orders query itself
    console.log('\n📦 Running the exact query from deliveryControllerEnhanced.js...');
    const [customOrders] = await connection.execute(`
      SELECT 
        co.id,
        co.custom_order_id as order_number,
        co.customer_name,
        'custom_order' as order_type,
        COALESCE(co.delivery_status, ds.delivery_status) as delivery_status,
        ds.delivery_date as scheduled_delivery_date,
        ds.id as delivery_schedule_id
      FROM custom_orders co
      LEFT JOIN (
        SELECT 
          custom_order_id,
          payment_amount,
          verified_at,
          ROW_NUMBER() OVER (PARTITION BY custom_order_id ORDER BY verified_at DESC) as rn
        FROM custom_order_payments 
        WHERE payment_status = 'verified'
      ) latest_payment ON co.custom_order_id = latest_payment.custom_order_id AND latest_payment.rn = 1
      LEFT JOIN delivery_schedules_enhanced ds ON ds.order_number = co.custom_order_id
      WHERE co.status IN ('confirmed', 'approved', 'completed')
      AND co.payment_status = 'verified'
      AND co.payment_verified_at IS NOT NULL
      AND co.custom_order_id = 'CUSTOM-MCNQQ7NW-GQEOI'
      ORDER BY co.created_at DESC
    `);
    
    console.log(`Query returned ${customOrders.length} rows for CUSTOM-MCNQQ7NW-GQEOI:`);
    customOrders.forEach((order, index) => {
      console.log(`  Row ${index + 1}: ID=${order.id}, OrderNumber=${order.order_number}, DeliveryScheduleID=${order.delivery_schedule_id}, DeliveryStatus=${order.delivery_status}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking duplicates:', error);
  } finally {
    if (connection) await connection.end();
  }
}

checkDuplicateDeliverySchedules();
