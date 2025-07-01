const mysql = require('mysql2/promise');
require('dotenv').config({ path: './server/.env' });

async function checkDeliveryTables() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'seven_four_clothing'
    });

    console.log('📊 CHECKING DELIVERY SCHEDULE TABLES:');
    
    // Check delivery_schedules table
    try {
      const [schedules1] = await connection.execute('SELECT COUNT(*) as count FROM delivery_schedules');
      console.log('delivery_schedules table:', schedules1[0].count, 'records');
      
      if (schedules1[0].count > 0) {
        const [recent1] = await connection.execute('SELECT * FROM delivery_schedules ORDER BY created_at DESC LIMIT 3');
        console.log('Recent delivery_schedules:');
        recent1.forEach((s, i) => {
          console.log(`  ${i+1}. ID: ${s.id}, Order: ${s.order_id}, Date: ${s.delivery_date}, Status: ${s.delivery_status}`);
        });
        console.log('');
      }
    } catch (e) {
      console.log('delivery_schedules table: ERROR -', e.message);
    }
    
    // Check delivery_schedules_enhanced table  
    try {
      const [schedules2] = await connection.execute('SELECT COUNT(*) as count FROM delivery_schedules_enhanced');
      console.log('delivery_schedules_enhanced table:', schedules2[0].count, 'records');
      
      if (schedules2[0].count > 0) {
        const [recent2] = await connection.execute('SELECT * FROM delivery_schedules_enhanced ORDER BY created_at DESC LIMIT 3');
        console.log('Recent delivery_schedules_enhanced:');
        recent2.forEach((s, i) => {
          console.log(`  ${i+1}. ID: ${s.id}, Order: ${s.order_id}, Date: ${s.delivery_date}, Status: ${s.delivery_status}`);
        });
        console.log('');
      }
    } catch (e) {
      console.log('delivery_schedules_enhanced table: ERROR -', e.message);
    }

    // Check which API endpoint the frontend is calling
    console.log('🔍 SIMULATING FRONTEND API CALL:');
    console.log('Calling: GET /delivery-enhanced/calendar?year=2025&month=7');
    
    // Simulate the calendar API call
    const year = 2025;
    const month = 7;
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = `${year}-${(month + 1).toString().padStart(2, '0')}-01`;
    
    console.log(`Query range: ${startDate} to ${endDate}`);
    
    // Try the calendar query that the API uses
    try {
      const [calendarData] = await connection.execute(`
        SELECT 
          dc.*,
          COUNT(ds.id) as scheduled_deliveries
        FROM delivery_calendar dc
        LEFT JOIN delivery_schedules_enhanced ds ON dc.calendar_date = ds.delivery_date
        WHERE dc.calendar_date >= ? AND dc.calendar_date < ?
        GROUP BY dc.id, dc.calendar_date
        ORDER BY dc.calendar_date
      `, [startDate, endDate]);
      
      console.log(`Found ${calendarData.length} calendar entries`);
      
      if (calendarData.length > 0) {
        console.log('Sample calendar data:');
        calendarData.slice(0, 3).forEach((day, i) => {
          console.log(`  ${i+1}. ${day.calendar_date}: ${day.scheduled_deliveries} deliveries`);
        });
      }
      
    } catch (e) {
      console.log('Calendar query failed:', e.message);
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkDeliveryTables();
