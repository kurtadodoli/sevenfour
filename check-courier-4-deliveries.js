const mysql = require('mysql2/promise');

async function checkCourierDeliveries() {
  const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 's3v3n-f0ur-cl0thing*',
    database: 'seven_four_clothing',
    port: 3306
  };

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected');

    // Check delivery_schedules table
    console.log('\n📦 Checking delivery_schedules table...');
    const [schedules] = await connection.execute(`
      SELECT id, courier_id, delivery_status, delivery_date, created_at
      FROM delivery_schedules 
      WHERE courier_id = 4
      ORDER BY created_at DESC
    `);
    
    console.log(`Found ${schedules.length} delivery schedules for courier 4:`);
    schedules.forEach(schedule => {
      console.log(`  - Schedule ID: ${schedule.id}, Status: ${schedule.delivery_status}, Date: ${schedule.delivery_date}`);
    });

    // Check delivery_schedules_enhanced table
    console.log('\n📦 Checking delivery_schedules_enhanced table...');
    const [enhancedSchedules] = await connection.execute(`
      SELECT id, courier_id, delivery_status, delivery_date, created_at
      FROM delivery_schedules_enhanced 
      WHERE courier_id = 4
      ORDER BY created_at DESC
    `);
    
    console.log(`Found ${enhancedSchedules.length} enhanced delivery schedules for courier 4:`);
    enhancedSchedules.forEach(schedule => {
      console.log(`  - Enhanced Schedule ID: ${schedule.id}, Status: ${schedule.delivery_status}, Date: ${schedule.delivery_date}`);
    });

    // Check for active deliveries (the ones blocking deletion)
    console.log('\n🔍 Checking active deliveries (blocking deletion)...');
    const [activeDeliveries] = await connection.execute(`
      SELECT id, courier_id, delivery_status, delivery_date
      FROM delivery_schedules 
      WHERE courier_id = 4 AND delivery_status IN ('pending', 'scheduled', 'in_transit', 'delayed')
    `);
    
    const [activeEnhancedDeliveries] = await connection.execute(`
      SELECT id, courier_id, delivery_status, delivery_date
      FROM delivery_schedules_enhanced 
      WHERE courier_id = 4 AND delivery_status IN ('pending', 'scheduled', 'in_transit', 'delayed')
    `);

    console.log(`Active deliveries in delivery_schedules: ${activeDeliveries.length}`);
    console.log(`Active deliveries in delivery_schedules_enhanced: ${activeEnhancedDeliveries.length}`);
    
    const totalActive = activeDeliveries.length + activeEnhancedDeliveries.length;
    console.log(`\n⚠️ Total active deliveries blocking deletion: ${totalActive}`);

    if (totalActive > 0) {
      console.log('\n🔧 To force delete this courier, we need to:');
      console.log('1. Update active deliveries to completed/delivered status, OR');
      console.log('2. Force delete by removing the courier despite active deliveries');
      
      console.log('\nActive delivery details:');
      [...activeDeliveries, ...activeEnhancedDeliveries].forEach(delivery => {
        console.log(`  - ID: ${delivery.id}, Status: ${delivery.delivery_status}, Date: ${delivery.delivery_date}`);
      });
    }

    await connection.end();
  } catch (error) {
    console.error('❌ Database error:', error);
    if (connection) await connection.end();
  }
}

checkCourierDeliveries();
