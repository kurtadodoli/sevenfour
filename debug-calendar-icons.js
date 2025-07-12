// Debug and fix calendar icons not appearing
const mysql = require('mysql2/promise');
const { dbConfig } = require('./server/config/db');

async function debugCalendarIcons() {
    const connection = await mysql.createConnection(dbConfig);
    
    console.log('🔍 === DEBUGGING CALENDAR ICONS ===');
    
    // First, let's see what orders have scheduled delivery dates
    const [ordersWithDates] = await connection.execute(`
        SELECT 
            id, order_number, scheduled_delivery_date, delivery_status,
            total_amount
        FROM orders 
        WHERE scheduled_delivery_date IS NOT NULL
        ORDER BY scheduled_delivery_date DESC
        LIMIT 10
    `);
    
    console.log(`\n📦 Orders with scheduled delivery dates (${ordersWithDates.length}):`);
    ordersWithDates.forEach(order => {
        const date = new Date(order.scheduled_delivery_date);
        console.log(`- ${order.order_number}: ${date.toDateString()}, Status: ${order.delivery_status}`);
    });
    
    // Check delivery_schedules_enhanced table
    const [enhancedSchedules] = await connection.execute(`
        SELECT 
            id, order_id, order_number, delivery_date, delivery_status, order_type
        FROM delivery_schedules_enhanced
        ORDER BY delivery_date DESC
        LIMIT 10
    `);
    
    console.log(`\n📋 Enhanced delivery schedules (${enhancedSchedules.length}):`);
    enhancedSchedules.forEach(schedule => {
        const date = new Date(schedule.delivery_date);
        console.log(`- Order ${schedule.order_number} (ID: ${schedule.order_id}): ${date.toDateString()}, Status: ${schedule.delivery_status}`);
    });
    
    // Now let's check what the calendar API would return for today specifically
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    
    console.log(`\n🗓️ Testing calendar API for ${year}-${month}:`);
    
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = `${year}-${(month + 1).toString().padStart(2, '0')}-01`;
    
    // This is the same query used in deliveryControllerEnhanced.js
    const [calendarData] = await connection.execute(`
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
    
    console.log(`\n📅 Calendar API would return ${calendarData.length} schedules for this month`);
    
    // Group by date to see what dates have deliveries
    const schedulesByDate = {};
    calendarData.forEach(schedule => {
        const dateKey = schedule.delivery_date.toISOString().split('T')[0];
        if (!schedulesByDate[dateKey]) {
            schedulesByDate[dateKey] = [];
        }
        schedulesByDate[dateKey].push(schedule);
    });
    
    console.log(`\n📊 Dates with deliveries:`);
    Object.keys(schedulesByDate).forEach(dateKey => {
        const date = new Date(dateKey);
        const count = schedulesByDate[dateKey].length;
        console.log(`- ${date.toDateString()}: ${count} delivery(ies)`);
        schedulesByDate[dateKey].forEach(schedule => {
            console.log(`  - Order ${schedule.order_number}, Status: ${schedule.delivery_status}`);
        });
    });
    
    // Check if there's a mismatch in data
    const todayKey = today.toISOString().split('T')[0];
    const todaySchedules = schedulesByDate[todayKey] || [];
    const todayOrders = ordersWithDates.filter(order => {
        const orderDate = new Date(order.scheduled_delivery_date);
        return orderDate.toDateString() === today.toDateString();
    });
    
    console.log(`\n🔍 TODAY'S DATA COMPARISON:`);
    console.log(`Today (${today.toDateString()}):`);
    console.log(`- Enhanced schedules: ${todaySchedules.length}`);
    console.log(`- Orders with dates: ${todayOrders.length}`);
    
    if (todaySchedules.length === 0 && todayOrders.length > 0) {
        console.log('❌ MISMATCH: Orders have scheduled dates but no enhanced schedules exist');
        console.log('💡 Solution: Need to sync orders table with delivery_schedules_enhanced table');
    } else if (todaySchedules.length > 0) {
        console.log('✅ Enhanced schedules exist - icons should appear');
    } else {
        console.log('ℹ️ No deliveries scheduled for today - icons correctly not shown');
    }
    
    await connection.end();
}

debugCalendarIcons().catch(console.error);
