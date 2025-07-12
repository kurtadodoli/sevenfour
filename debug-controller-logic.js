const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function debugCalendarLogic() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    
    console.log('🔍 Debugging calendar controller logic step by step...');
    
    const year = '2025';
    const month = '7';
    const startDate = `${year}-${month.padStart(2, '0')}-01`;
    const endDate = `${year}-${(parseInt(month) + 1).toString().padStart(2, '0')}-01`;
    
    console.log(`📅 Date range: ${startDate} to ${endDate}`);
    
    // Step 1: Get delivery schedules (exact same query as controller)
    console.log('\n🔍 Step 1: Getting delivery schedules...');
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
    
    console.log(`✅ Found ${deliverySchedules.length} delivery schedules:`);
    deliverySchedules.forEach(schedule => {
      console.log(`- ID ${schedule.id}: Order ${schedule.order_number}, Date: ${schedule.delivery_date.toISOString().split('T')[0]}, Status: ${schedule.delivery_status}`);
    });
    
    // Step 2: Group schedules by date (exact same logic as controller)
    console.log('\n🔍 Step 2: Grouping by date...');
    const schedulesByDate = {};
    deliverySchedules.forEach(schedule => {
      const dateKey = schedule.delivery_date.toISOString().split('T')[0];
      if (!schedulesByDate[dateKey]) {
        schedulesByDate[dateKey] = [];
      }
      schedulesByDate[dateKey].push(schedule);
    });
    
    console.log('📊 Schedules grouped by date:');
    Object.keys(schedulesByDate).forEach(dateKey => {
      console.log(`- ${dateKey}: ${schedulesByDate[dateKey].length} deliveries`);
      schedulesByDate[dateKey].forEach(schedule => {
        console.log(`  • Order ${schedule.order_number}, Status: ${schedule.delivery_status}`);
      });
    });
    
    // Step 3: Get calendar settings (exact same logic as controller)
    console.log('\n🔍 Step 3: Getting calendar settings...');
    const datesWithDeliveries = Object.keys(schedulesByDate);
    console.log('Dates with deliveries:', datesWithDeliveries);
    
    let calendarSettings = {};
    
    if (datesWithDeliveries.length > 0) {
      const placeholders = datesWithDeliveries.map(() => '?').join(',');
      const [calendarData] = await connection.execute(`
        SELECT 
          dc.*
        FROM delivery_calendar dc
        WHERE DATE(dc.calendar_date) IN (${placeholders})
      `, datesWithDeliveries);
      
      console.log(`✅ Found ${calendarData.length} calendar settings`);
      
      calendarData.forEach(cal => {
        const dateKey = cal.calendar_date.toISOString().split('T')[0];
        calendarSettings[dateKey] = cal;
        console.log(`- Calendar setting for ${dateKey}`);
      });
    }
    
    // Step 4: Create final response (exact same logic as controller)
    console.log('\n🔍 Step 4: Creating final calendar response...');
    const calendarWithSchedules = datesWithDeliveries.map(dateKey => {
      const deliveriesCount = schedulesByDate[dateKey].length;
      console.log(`Processing date ${dateKey} with ${deliveriesCount} deliveries`);
      
      const defaultSettings = {
        id: null,
        calendar_date: new Date(dateKey + 'T12:00:00.000Z'),
        max_deliveries: 3,
        current_bookings: deliveriesCount,
        is_available: 1,
        is_holiday: 0,
        is_weekend: [0, 6].includes(new Date(dateKey).getDay()) ? 1 : 0,
        special_notes: null,
        weather_status: 'good',
        delivery_restrictions: null,
        created_at: new Date(),
        updated_at: new Date(),
        scheduled_deliveries: deliveriesCount
      };
      
      const settings = calendarSettings[dateKey] ? {
        ...calendarSettings[dateKey],
        scheduled_deliveries: deliveriesCount,
        current_bookings: deliveriesCount
      } : defaultSettings;
      
      return {
        ...settings,
        deliveries: schedulesByDate[dateKey] || []
      };
    }).sort((a, b) => new Date(a.calendar_date) - new Date(b.calendar_date));
    
    console.log(`\n✅ Final calendar response would have ${calendarWithSchedules.length} entries:`);
    calendarWithSchedules.forEach(entry => {
      const dateStr = entry.calendar_date.toISOString().split('T')[0];
      console.log(`- ${dateStr}: ${entry.deliveries.length} deliveries, Scheduled: ${entry.scheduled_deliveries}`);
      entry.deliveries.forEach(delivery => {
        console.log(`  • Order ${delivery.order_number}, Status: ${delivery.delivery_status}`);
      });
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (connection) await connection.end();
  }
}

debugCalendarLogic();
