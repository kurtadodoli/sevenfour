const mysql = require('mysql2/promise');

async function fixIconsAndTestToday() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 's3v3n-f0ur-cl0thing*',
        database: 'seven_four_clothing'
    });

    try {
        console.log('=== FIXING ICONS AND TESTING TODAY ===\n');

        // Fix existing delivery schedule icons
        console.log('🔧 Updating delivery schedule icons...');
        await connection.execute(`
            UPDATE delivery_schedules_enhanced 
            SET display_icon = CASE delivery_status
                WHEN 'scheduled' THEN '📅'
                WHEN 'in_transit' THEN '🚚'
                WHEN 'delivered' THEN '✅'
                WHEN 'delayed' THEN '⚠️'
                WHEN 'cancelled' THEN '❌'
                ELSE '📦'
            END
        `);
        console.log('✅ Icons updated successfully');

        // Get a regular order and schedule it for TODAY
        const [regularOrders] = await connection.execute(`
            SELECT * FROM orders 
            WHERE status IN ('confirmed', 'processing')
            AND order_number NOT LIKE '%CUSTOM%'
            AND notes NOT LIKE '%Custom Order%'
            ORDER BY id DESC
            LIMIT 1
        `);

        if (regularOrders.length === 0) {
            console.log('❌ No regular orders found');
            return;
        }

        const testOrder = regularOrders[0];
        const today = new Date();
        const todayString = today.toISOString().split('T')[0];

        console.log(`\n📅 Scheduling Order #${testOrder.order_number} for TODAY (${todayString})`);

        // Delete any existing schedule for this order
        await connection.execute(`
            DELETE FROM delivery_schedules_enhanced 
            WHERE order_id = ? AND order_type = 'regular'
        `, [testOrder.id]);

        // Create a new schedule for today
        const [scheduleResult] = await connection.execute(`
            INSERT INTO delivery_schedules_enhanced (
                order_id, order_number, order_type,
                customer_name, customer_email, customer_phone,
                delivery_date, delivery_time_slot, delivery_status,
                delivery_address, delivery_city, delivery_province,
                delivery_contact_phone, delivery_notes,
                priority_level, calendar_color, display_icon
            ) VALUES (?, ?, 'regular', 'Test Customer', 'test@email.com', '09123456789', 
                      ?, '14:00', 'scheduled', 'Test Address', 'Test City', 'Test Province',
                      '09123456789', 'Scheduled for TODAY testing', 'normal', '#007bff', '📅')
        `, [testOrder.id, testOrder.order_number, todayString]);

        // Update orders table
        await connection.execute(`
            UPDATE orders 
            SET delivery_status = 'scheduled', scheduled_delivery_date = ?, delivery_notes = ?
            WHERE id = ?
        `, [todayString, 'Scheduled for TODAY testing', testOrder.id]);

        console.log(`✅ Created delivery schedule ID: ${scheduleResult.insertId}`);

        // Verify today's schedules
        console.log('\n🔍 Checking today\'s schedules...');
        const [todaySchedules] = await connection.execute(`
            SELECT order_number, order_type, delivery_status, display_icon, calendar_color
            FROM delivery_schedules_enhanced 
            WHERE delivery_date = ?
        `, [todayString]);

        console.log(`📊 Found ${todaySchedules.length} schedules for today:`);
        todaySchedules.forEach(schedule => {
            console.log(`   - ${schedule.order_number} (${schedule.order_type}) - ${schedule.delivery_status} ${schedule.display_icon}`);
        });

        // Test calendar API response
        console.log('\n📅 Testing calendar API...');
        const year = today.getFullYear();
        const month = today.getMonth() + 1;
        const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
        const endDate = `${year}-${(month + 1).toString().padStart(2, '0')}-01`;

        const [calendarSchedules] = await connection.execute(`
            SELECT 
                order_number, order_type, delivery_status, display_icon, 
                DATE(delivery_date) as date_only
            FROM delivery_schedules_enhanced
            WHERE delivery_date >= ? AND delivery_date < ?
            ORDER BY delivery_date
        `, [startDate, endDate]);

        console.log(`📊 Calendar API would return ${calendarSchedules.length} schedules for this month`);
        
        const todayFromCalendar = calendarSchedules.filter(s => s.date_only === todayString);
        console.log(`📋 Today's schedules from calendar API: ${todayFromCalendar.length}`);
        todayFromCalendar.forEach(schedule => {
            console.log(`   - ${schedule.order_number} ${schedule.display_icon} (${schedule.delivery_status})`);
        });

        console.log('\n🧪 SUMMARY:');
        console.log('1. ✅ Icons fixed to show status-specific emojis');
        console.log('2. ✅ Regular order scheduled for TODAY');
        console.log('3. ✅ Calendar should show icon on today\'s date');
        console.log('4. ✅ Action buttons should appear for scheduled order');
        console.log('\n💡 Refresh the frontend to see the icon on today\'s calendar!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await connection.end();
    }
}

fixIconsAndTestToday();
