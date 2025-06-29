// Direct database query to check delivery schedules
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 's3v3n-f0ur-cl0thing*',
  database: 'seven_four_clothing',
  port: 3306
};

async function checkDeliveryTables() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database\n');
    
    // Check original delivery_schedules table
    console.log('📊 Checking delivery_schedules table...');
    try {
      const [schedules] = await connection.execute(`
        SELECT id, order_id, courier_id, delivery_status, delivery_date, created_at 
        FROM delivery_schedules 
        ORDER BY created_at DESC 
        LIMIT 10
      `);
      
      console.log(`Found ${schedules.length} records in delivery_schedules:`);
      schedules.forEach(schedule => {
        console.log(`  ID: ${schedule.id}, Order: ${schedule.order_id}, Courier: ${schedule.courier_id}, Status: ${schedule.delivery_status}, Date: ${schedule.delivery_date}`);
      });
      
      // Check active deliveries for courier 4
      const [activeCourier4] = await connection.execute(`
        SELECT COUNT(*) as active_count 
        FROM delivery_schedules 
        WHERE courier_id = 4 AND delivery_status IN ('pending', 'scheduled', 'in_transit', 'delayed')
      `);
      console.log(`\nActive deliveries for courier 4 in delivery_schedules: ${activeCourier4[0].active_count}`);
      
    } catch (error) {
      console.log('❌ delivery_schedules table error:', error.message);
    }
    
    // Check enhanced delivery_schedules_enhanced table
    console.log('\n📊 Checking delivery_schedules_enhanced table...');
    try {
      const [enhancedSchedules] = await connection.execute(`
        SELECT id, order_id, courier_id, delivery_status, delivery_date, created_at 
        FROM delivery_schedules_enhanced 
        ORDER BY created_at DESC 
        LIMIT 10
      `);
      
      console.log(`Found ${enhancedSchedules.length} records in delivery_schedules_enhanced:`);
      enhancedSchedules.forEach(schedule => {
        console.log(`  ID: ${schedule.id}, Order: ${schedule.order_id}, Courier: ${schedule.courier_id}, Status: ${schedule.delivery_status}, Date: ${schedule.delivery_date}`);
      });
      
      // Check active deliveries for courier 4
      const [enhancedActiveCourier4] = await connection.execute(`
        SELECT COUNT(*) as active_count 
        FROM delivery_schedules_enhanced 
        WHERE courier_id = 4 AND delivery_status IN ('pending', 'scheduled', 'in_transit', 'delayed')
      `);
      console.log(`\nActive deliveries for courier 4 in delivery_schedules_enhanced: ${enhancedActiveCourier4[0].active_count}`);
      
    } catch (error) {
      console.log('❌ delivery_schedules_enhanced table error:', error.message);
    }
    
    // Check all tables for courier 4
    console.log('\n🔍 Searching all delivery-related tables for courier 4...');
    
    const tables = ['delivery_schedules', 'delivery_schedules_enhanced'];
    for (const table of tables) {
      try {
        const [results] = await connection.execute(`
          SELECT * FROM ${table} WHERE courier_id = 4
        `);
        console.log(`\n${table} records for courier 4:`);
        results.forEach(record => {
          console.log(`  ${JSON.stringify(record, null, 2)}`);
        });
      } catch (error) {
        console.log(`❌ ${table} error:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkDeliveryTables().then(() => {
  console.log('\n✅ Database check complete');
}).catch(error => {
  console.error('❌ Database check failed:', error);
});
