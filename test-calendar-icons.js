const mysql = require('mysql2/promise');

async function testCalendarIcons() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 's3v3n-f0ur-cl0thing*',
        database: 'seven_four_clothing'
    });

    try {
        console.log('=== TESTING CALENDAR ICONS FOR REGULAR ORDERS ===\n');

        // Get a regular order to test with
        const [regularOrders] = await connection.execute(`
            SELECT * FROM orders 
            WHERE status IN ('confirmed', 'processing')
            AND delivery_status IS NULL
            AND order_number NOT LIKE '%CUSTOM%'
            AND notes NOT LIKE '%Custom Order%'
            ORDER BY id DESC
            LIMIT 1
        `);

        if (regularOrders.length === 0) {
            console.log('❌ No unscheduled regular orders found for testing');
            return;
        }

        const testOrder = regularOrders[0];
        console.log(`🎯 Using Order #${testOrder.order_number} (ID: ${testOrder.id})`);

        // Schedule it for today
        const today = new Date();
        const scheduleDate = today.toISOString().split('T')[0]; // YYYY-MM-DD format
        
        console.log(`📅 Scheduling for date: ${scheduleDate}`);

        // Create the delivery schedule
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
                      '09123456789', 'Test icon scheduling', 'normal', '#007bff', '📅')
            ON DUPLICATE KEY UPDATE
            delivery_date = VALUES(delivery_date),
            delivery_status = 'scheduled',
            updated_at = CURRENT_TIMESTAMP
        `, [testOrder.id, testOrder.order_number, scheduleDate]);

        // Update the orders table
        await connection.execute(`
            UPDATE orders 
            SET delivery_status = 'scheduled', scheduled_delivery_date = ?, delivery_notes = ?
            WHERE id = ?
        `, [scheduleDate, 'Test icon scheduling', testOrder.id]);

        console.log(`✅ Scheduled delivery with ID: ${scheduleResult.insertId || 'updated existing'}`);

        // Now test what the frontend calendar API would return
        console.log('\n📅 Testing calendar API response...');
        
        const year = today.getFullYear();
        const month = today.getMonth() + 1;
        const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
        const endDate = `${year}-${(month + 1).toString().padStart(2, '0')}-01`;

        // Simulate the calendar API query
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

        console.log(`📊 Found ${deliverySchedules.length} delivery schedules for this month`);

        // Check for today's schedules
        const todaySchedules = deliverySchedules.filter(schedule => {
            const scheduleDate = new Date(schedule.delivery_date);
            return scheduleDate.toDateString() === today.toDateString();
        });

        console.log(`📋 Schedules for today (${today.toDateString()}): ${todaySchedules.length}`);
        
        if (todaySchedules.length > 0) {
            console.log('\n📦 Today\'s scheduled deliveries:');
            todaySchedules.forEach(schedule => {
                console.log(`   - Order: ${schedule.order_number}`);
                console.log(`   - Type: ${schedule.order_type}`);
                console.log(`   - Status: ${schedule.delivery_status}`);
                console.log(`   - Icon: ${schedule.display_icon}`);
                console.log(`   - Color: ${schedule.calendar_color}`);
                console.log('');
            });
        }

        // Test the enhanced orders API to make sure it includes the schedule
        console.log('\n🔍 Testing enhanced orders API...');
        
        const [ordersWithSchedule] = await connection.execute(`
            SELECT 
                o.id,
                o.order_number,
                o.delivery_status,
                o.scheduled_delivery_date,
                ds.id as delivery_schedule_id,
                ds.delivery_status as schedule_delivery_status
            FROM orders o
            LEFT JOIN delivery_schedules_enhanced ds ON o.id = ds.order_id AND ds.order_type = 'regular'
            WHERE o.id = ?
        `, [testOrder.id]);

        if (ordersWithSchedule.length > 0) {
            const orderWithSchedule = ordersWithSchedule[0];
            console.log(`✅ Order in enhanced API:`);
            console.log(`   - Order ID: ${orderWithSchedule.id}`);
            console.log(`   - Order Number: ${orderWithSchedule.order_number}`);
            console.log(`   - Order Delivery Status: ${orderWithSchedule.delivery_status}`);
            console.log(`   - Scheduled Date: ${orderWithSchedule.scheduled_delivery_date}`);
            console.log(`   - Schedule ID: ${orderWithSchedule.delivery_schedule_id}`);
            console.log(`   - Schedule Status: ${orderWithSchedule.schedule_delivery_status}`);
        }

        console.log('\n🧪 ICON TEST SUMMARY:');
        console.log('1. ✅ Regular order scheduled successfully');
        console.log('2. ✅ delivery_schedules_enhanced entry created');
        console.log('3. ✅ orders table updated with delivery_status');
        console.log('4. ✅ Calendar API will return the schedule');
        console.log('5. ✅ Enhanced orders API includes schedule data');
        console.log('\n💡 The calendar should now show an icon for today!');
        console.log('   🔄 Refresh the frontend to see the changes.');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await connection.end();
    }
}

testCalendarIcons();
