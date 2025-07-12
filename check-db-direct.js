const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function checkJuly7Database() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    
    console.log('🔍 Direct database query for July 7, 2025...');
    
    // Query the exact same way the controller does
    const startDate = '2025-07-01';
    const endDate = '2025-08-01';
    
    const [deliverySchedules] = await connection.execute(`
      SELECT 
        ds.*,
        c.name as courier_name,
        c.phone_number as courier_phone,
        c.vehicle_type
      FROM delivery_schedules_enhanced ds
      LEFT JOIN couriers c ON ds.courier_id = c.id
      WHERE ds.delivery_date >= ? AND ds.delivery_date < ?
      ORDER BY ds.delivery_date, ds.delivery_time_slot
    `, [startDate, endDate]);
    
    console.log(`📊 Query returned ${deliverySchedules.length} schedules for July 2025:`);
    
    deliverySchedules.forEach(schedule => {
      console.log(`- ID ${schedule.id}: Order ${schedule.order_number}, Date: ${schedule.delivery_date.toISOString().split('T')[0]}, Status: ${schedule.delivery_status}`);
    });
    
    console.log('\n🔍 Filtering for July 7th specifically:');
    const july7Schedules = deliverySchedules.filter(schedule => {
      const dateKey = schedule.delivery_date.toISOString().split('T')[0];
      return dateKey === '2025-07-07';
    });
    
    console.log(`Found ${july7Schedules.length} schedules for July 7th:`);
    july7Schedules.forEach(schedule => {
      console.log(`- Order ${schedule.order_number}, Status: ${schedule.delivery_status}, Time: ${schedule.delivery_time_slot}`);
    });
    
  } catch (error) {
    console.error('❌ Database Error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

checkJuly7Database();
