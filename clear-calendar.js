const mysql = require('mysql2/promise');

async function clearDeliverySchedules() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 's3v3n-f0ur-cl0thing*',
        database: 'seven_four_clothing'
    });

    try {
        console.log('🔍 Checking current delivery schedules...');

        // Check all delivery schedules
        const [allSchedules] = await connection.execute('SELECT * FROM delivery_schedules');
        console.log('\n📅 Current delivery schedules:', allSchedules);

        if (allSchedules.length > 0) {
            console.log(`\n🗑️ Found ${allSchedules.length} delivery schedules to clear...`);
            
            // Delete all delivery schedules
            await connection.execute('DELETE FROM delivery_schedules');
            console.log('✅ All delivery schedules cleared!');

            // Verify deletion
            const [remaining] = await connection.execute('SELECT COUNT(*) as count FROM delivery_schedules');
            console.log(`📊 Remaining schedules: ${remaining[0].count}`);
        } else {
            console.log('✅ No delivery schedules found - calendar should be empty');
        }

        // Also check if there are any orders with delivery status that might show on calendar
        const [ordersWithDelivery] = await connection.execute(
            'SELECT id, order_number, status, delivery_status, scheduled_delivery_date FROM orders WHERE scheduled_delivery_date IS NOT NULL OR delivery_status IS NOT NULL'
        );
        
        if (ordersWithDelivery.length > 0) {
            console.log('\n📦 Orders with delivery information:', ordersWithDelivery);
            
            // Clear delivery information from orders
            await connection.execute(
                'UPDATE orders SET scheduled_delivery_date = NULL, delivery_status = NULL, delivery_notes = NULL WHERE scheduled_delivery_date IS NOT NULL OR delivery_status IS NOT NULL'
            );
            console.log('✅ Cleared delivery information from orders');
        }

        // Check custom orders too
        const [customOrdersWithDelivery] = await connection.execute(
            'SELECT id, custom_order_id, delivery_status FROM custom_orders WHERE delivery_status IS NOT NULL'
        );
        
        if (customOrdersWithDelivery.length > 0) {
            console.log('\n🎨 Custom orders with delivery information:', customOrdersWithDelivery);
            
            // Clear delivery information from custom orders
            await connection.execute(
                'UPDATE custom_orders SET delivery_status = NULL, delivery_date = NULL, delivery_notes = NULL WHERE delivery_status IS NOT NULL'
            );
            console.log('✅ Cleared delivery information from custom orders');
        }

        console.log('\n🎉 Calendar should now be completely empty!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await connection.end();
    }
}

clearDeliverySchedules();
