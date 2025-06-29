const mysql = require('mysql2/promise');

async function checkDeliveryTables() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 's3v3n-f0ur-cl0thing*',
        database: 'seven_four_clothing'
    });

    try {
        console.log('=== CHECKING DELIVERY TABLES ===\n');

        // Check if delivery_schedules_enhanced exists
        try {
            const [enhanced] = await connection.execute(`DESCRIBE delivery_schedules_enhanced`);
            console.log('📋 DELIVERY_SCHEDULES_ENHANCED TABLE EXISTS:');
            enhanced.forEach(col => {
                console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(nullable)' : '(not null)'}`);
            });
        } catch (error) {
            console.log('❌ delivery_schedules_enhanced table does not exist');
        }

        // Check if delivery_schedules exists
        try {
            const [regular] = await connection.execute(`DESCRIBE delivery_schedules`);
            console.log('\n📋 DELIVERY_SCHEDULES TABLE EXISTS:');
            regular.forEach(col => {
                console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(nullable)' : '(not null)'}`);
            });
            
            // Check data in delivery_schedules
            const [scheduleData] = await connection.execute(`SELECT * FROM delivery_schedules LIMIT 5`);
            console.log('\n📊 SAMPLE DELIVERY_SCHEDULES DATA:');
            scheduleData.forEach((schedule, index) => {
                console.log(`🚚 Schedule ${index + 1}:`, {
                    id: schedule.id,
                    order_id: schedule.order_id,
                    order_type: schedule.order_type,
                    delivery_status: schedule.delivery_status,
                    delivery_date: schedule.delivery_date
                });
            });
        } catch (error) {
            console.log('❌ delivery_schedules table does not exist or error:', error.message);
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await connection.end();
    }
}

checkDeliveryTables();
