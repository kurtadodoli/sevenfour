const mysql = require('mysql2/promise');
require('dotenv').config({ path: './server/.env' });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'seven_four_clothing'
};

async function checkDeliveryTables() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    
    console.log('🔍 Checking delivery-related tables...');
    const [tables] = await connection.execute('SHOW TABLES LIKE "%delivery%"');
    console.log('📋 Delivery-related tables:');
    tables.forEach(table => {
      console.log('  - ' + Object.values(table)[0]);
    });
    
    console.log('\n🔍 Checking if delivery_calendar table exists...');
    const [calendarExists] = await connection.execute('SHOW TABLES LIKE "delivery_calendar"');
    if (calendarExists.length === 0) {
      console.log('❌ delivery_calendar table does NOT exist');
    } else {
      console.log('✅ delivery_calendar table exists');
    }
    
    console.log('\n🔍 Checking if delivery_schedules_enhanced table exists...');
    const [enhancedExists] = await connection.execute('SHOW TABLES LIKE "delivery_schedules_enhanced"');
    if (enhancedExists.length === 0) {
      console.log('❌ delivery_schedules_enhanced table does NOT exist');
    } else {
      console.log('✅ delivery_schedules_enhanced table exists');
    }
    
    console.log('\n🔍 Checking delivery_schedules table...');
    const [basicExists] = await connection.execute('SHOW TABLES LIKE "delivery_schedules"');
    if (basicExists.length > 0) {
      console.log('✅ delivery_schedules table exists');
      const [schedules] = await connection.execute('SELECT COUNT(*) as count FROM delivery_schedules');
      console.log(`📊 delivery_schedules contains ${schedules[0].count} records`);
    } else {
      console.log('❌ delivery_schedules table does NOT exist');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkDeliveryTables();
