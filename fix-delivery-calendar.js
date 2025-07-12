const mysql = require('mysql2/promise');
require('dotenv').config({ path: './server/.env' });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'seven_four_clothing'
};

async function fixDeliveryCalendar() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    
    console.log('🔧 Fixing delivery calendar and schedules...');
    
    // First, get all unique delivery dates from delivery_schedules_enhanced
    const [deliveryDates] = await connection.execute(`
      SELECT DISTINCT delivery_date 
      FROM delivery_schedules_enhanced 
      WHERE delivery_date IS NOT NULL
    `);
    
    console.log(`📅 Found ${deliveryDates.length} unique delivery dates`);
    
    // Create calendar entries for each delivery date
    for (const row of deliveryDates) {
      const deliveryDate = row.delivery_date;
      const dateStr = deliveryDate.toISOString().split('T')[0];
      
      console.log(`📅 Processing date: ${dateStr}`);
      
      // Check if calendar entry already exists
      const [existing] = await connection.execute(
        'SELECT id FROM delivery_calendar WHERE calendar_date = ?',
        [deliveryDate]
      );
      
      if (existing.length === 0) {
        // Create calendar entry
        await connection.execute(`
          INSERT INTO delivery_calendar (
            calendar_date, 
            max_deliveries, 
            current_bookings, 
            is_available, 
            is_holiday, 
            is_weekend,
            weather_status,
            created_at
          ) VALUES (?, 10, 1, 1, 0, 0, 'good', NOW())
        `, [deliveryDate]);
        console.log(`✅ Created calendar entry for ${dateStr}`);
      } else {
        console.log(`ℹ️ Calendar entry already exists for ${dateStr}`);
      }
    }
    
    // Update delivery status from 'delivered' to 'scheduled' so they show as active deliveries
    const [updateResult] = await connection.execute(`
      UPDATE delivery_schedules_enhanced 
      SET delivery_status = 'scheduled'
      WHERE delivery_status = 'delivered'
    `);
    
    console.log(`🔄 Updated ${updateResult.affectedRows} delivery schedules to 'scheduled' status`);
    
    // Verify the results
    console.log('\n📊 Verification:');
    const [calendarCount] = await connection.execute('SELECT COUNT(*) as count FROM delivery_calendar');
    console.log(`📅 delivery_calendar now has ${calendarCount[0].count} entries`);
    
    const [scheduleCount] = await connection.execute(`
      SELECT delivery_status, COUNT(*) as count 
      FROM delivery_schedules_enhanced 
      GROUP BY delivery_status
    `);
    console.log('📦 delivery_schedules_enhanced status counts:');
    scheduleCount.forEach(row => {
      console.log(`  - ${row.delivery_status}: ${row.count}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

fixDeliveryCalendar();
