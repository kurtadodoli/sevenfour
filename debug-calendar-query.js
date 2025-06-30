const mysql = require('mysql2/promise');

async function debugCalendar() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 's3v3n-f0ur-cl0thing*',
        database: 'seven_four_clothing'
    });

    try {
        console.log('=== DEBUGGING CALENDAR QUERY ===\n');

        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;
        const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
        const endDate = `${year}-${(month + 1).toString().padStart(2, '0')}-01`;

        console.log('Calendar query parameters:');
        console.log('  startDate:', startDate);
        console.log('  endDate:', endDate);
        console.log('  Current date:', today.toISOString());

        const [allSchedules] = await connection.execute(`
            SELECT 
                order_number, delivery_date, 
                DATE(delivery_date) as date_only,
                delivery_date >= ? as in_range_start,
                delivery_date < ? as in_range_end
            FROM delivery_schedules_enhanced
            ORDER BY delivery_date
        `, [startDate, endDate]);

        console.log(`\nAll ${allSchedules.length} schedules in database:`);
        allSchedules.forEach(s => {
            const inRange = s.in_range_start && s.in_range_end;
            console.log(`  ${s.order_number}: ${s.delivery_date} (${s.date_only}) - in range: ${inRange}`);
        });

        // Test the exact query the frontend would use
        console.log('\n📅 Testing frontend calendar query...');
        const [calendarResults] = await connection.execute(`
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

        console.log(`📊 Frontend calendar query returns ${calendarResults.length} schedules`);
        calendarResults.forEach(s => {
            console.log(`  - ${s.order_number} (${s.order_type}) on ${s.delivery_date} ${s.display_icon}`);
        });

        // Check what happens if we query for a wider range
        console.log('\n🔍 Testing wider date range...');
        const [widerResults] = await connection.execute(`
            SELECT order_number, delivery_date, order_type, delivery_status, display_icon
            FROM delivery_schedules_enhanced
            WHERE delivery_date >= '2025-06-01' AND delivery_date <= '2025-06-30'
            ORDER BY delivery_date
        `);

        console.log(`📊 Wider range (June 2025) returns ${widerResults.length} schedules`);
        widerResults.forEach(s => {
            console.log(`  - ${s.order_number} on ${s.delivery_date} ${s.display_icon}`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await connection.end();
    }
}

debugCalendar();
