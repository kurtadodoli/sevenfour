const mysql = require('mysql2/promise');
require('dotenv').config({ path: './server/.env' });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'seven_four_clothing'
};

async function inspectDeliveryTables() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    
    console.log('🔍 Checking delivery_calendar table...');
    const [calendarStructure] = await connection.execute('DESCRIBE delivery_calendar');
    console.log('📋 delivery_calendar structure:');
    calendarStructure.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type}`);
    });
    
    const [calendarData] = await connection.execute('SELECT * FROM delivery_calendar LIMIT 5');
    console.log(`📊 delivery_calendar contains ${calendarData.length} records (showing first 5):`);
    calendarData.forEach(row => {
      console.log(`  - Date: ${row.calendar_date}, Available: ${row.is_available}`);
    });
    
    console.log('\n🔍 Checking delivery_schedules_enhanced table...');
    const [enhancedStructure] = await connection.execute('DESCRIBE delivery_schedules_enhanced');
    console.log('📋 delivery_schedules_enhanced structure:');
    enhancedStructure.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type}`);
    });
    
    const [enhancedData] = await connection.execute('SELECT * FROM delivery_schedules_enhanced');
    console.log(`📊 delivery_schedules_enhanced contains ${enhancedData.length} records:`);
    enhancedData.forEach(row => {
      console.log(`  - Order: ${row.order_id}, Date: ${row.delivery_date}, Status: ${row.delivery_status}`);
    });
    
    console.log('\n🔍 Checking delivery_schedules table...');
    const [basicStructure] = await connection.execute('DESCRIBE delivery_schedules');
    console.log('📋 delivery_schedules structure:');
    basicStructure.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type}`);
    });
    
    const [basicData] = await connection.execute('SELECT * FROM delivery_schedules');
    console.log(`📊 delivery_schedules contains ${basicData.length} records:`);
    basicData.forEach(row => {
      console.log(`  - Date: ${row.delivery_date}, Time: ${row.delivery_time_slot}, Courier: ${row.courier_id}, Order: ${row.order_id}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

inspectDeliveryTables();
