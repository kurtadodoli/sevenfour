// Check delivery database tables
require('dotenv').config({ path: './server/.env' });
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'seven_four_clothing'
};

async function checkTables() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');
    
    // Check all tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('\n📋 All Tables in Database:');
    tables.forEach(table => {
      console.log('  -', Object.values(table)[0]);
    });
    
    // Check delivery-related tables specifically
    console.log('\n🚚 Checking Delivery Tables:');
    
    try {
      const [couriers] = await connection.execute('SELECT COUNT(*) as count FROM couriers');
      console.log(`✅ couriers: ${couriers[0].count} records`);
    } catch (e) {
      console.log('❌ couriers table not found');
    }
    
    try {
      const [calendar] = await connection.execute('SELECT COUNT(*) as count FROM delivery_calendar');
      console.log(`✅ delivery_calendar: ${calendar[0].count} records`);
    } catch (e) {
      console.log('❌ delivery_calendar table not found');
    }
    
    try {
      const [schedules] = await connection.execute('SELECT COUNT(*) as count FROM delivery_schedules_enhanced');
      console.log(`✅ delivery_schedules_enhanced: ${schedules[0].count} records`);
    } catch (e) {
      console.log('❌ delivery_schedules_enhanced table not found');
    }
    
    try {
      const [history] = await connection.execute('SELECT COUNT(*) as count FROM delivery_status_history');
      console.log(`✅ delivery_status_history: ${history[0].count} records`);
    } catch (e) {
      console.log('❌ delivery_status_history table not found');
    }
    
    // Check sample couriers
    try {
      const [sampleCouriers] = await connection.execute('SELECT name, phone_number, vehicle_type FROM couriers LIMIT 5');
      console.log('\n👥 Sample Couriers:');
      sampleCouriers.forEach(courier => {
        console.log(`  - ${courier.name} (${courier.vehicle_type}) - ${courier.phone_number}`);
      });
    } catch (e) {
      console.log('❌ Could not fetch sample couriers');
    }
    
    // Check calendar entries
    try {
      const [calendarSample] = await connection.execute('SELECT calendar_date, is_weekend FROM delivery_calendar ORDER BY calendar_date LIMIT 10');
      console.log('\n📅 Sample Calendar Entries:');
      calendarSample.forEach(entry => {
        console.log(`  - ${entry.calendar_date} ${entry.is_weekend ? '(Weekend)' : '(Weekday)'}`);
      });
    } catch (e) {
      console.log('❌ Could not fetch calendar entries');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkTables();
