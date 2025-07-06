const mysql = require('mysql2/promise');

async function checkDeliveryTables() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 's3v3n-f0ur-cl0thing*',
      database: 'seven_four_clothing'
    });

    console.log('📊 Checking couriers table...');
    const [courierColumns] = await connection.execute('DESCRIBE couriers');
    console.log('Couriers table columns:');
    courierColumns.forEach(col => console.log(`  ${col.Field} (${col.Type})`));

    console.log('\n📊 Checking delivery_schedules_enhanced table...');
    const [scheduleColumns] = await connection.execute('DESCRIBE delivery_schedules_enhanced');
    console.log('Delivery schedules table columns:');
    scheduleColumns.forEach(col => console.log(`  ${col.Field} (${col.Type})`));

    console.log('\n📊 Sample courier data...');
    const [couriers] = await connection.execute('SELECT * FROM couriers LIMIT 5');
    couriers.forEach(courier => {
      console.log(`Courier: ${courier.name} - ${courier.phone_number} (${courier.vehicle_type})`);
    });

    console.log('\n📊 Sample delivery schedules for custom orders...');
    const [schedules] = await connection.execute(`
      SELECT 
        ds.*,
        c.name as courier_name,
        c.phone_number as courier_phone
      FROM delivery_schedules_enhanced ds
      LEFT JOIN couriers c ON ds.courier_id = c.id
      WHERE ds.order_number LIKE 'CUSTOM-%'
      ORDER BY ds.delivery_date DESC
      LIMIT 5
    `);
    
    schedules.forEach(schedule => {
      console.log(`Schedule: ${schedule.order_number}`);
      console.log(`  Date: ${schedule.delivery_date}`);
      console.log(`  Time: ${schedule.delivery_time_slot}`);
      console.log(`  Courier: ${schedule.courier_name || 'Not assigned'} (${schedule.courier_phone || 'N/A'})`);
      console.log('');
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

checkDeliveryTables();
