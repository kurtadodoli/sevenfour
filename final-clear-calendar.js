const mysql = require('mysql2/promise');

async function checkAndClearOrders() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 's3v3n-f0ur-cl0thing*',
        database: 'seven_four_clothing'
    });

    try {
        console.log('🔍 Checking orders table structure...');

        // Get table structure first
        const [columns] = await connection.execute('DESCRIBE orders');
        console.log('\n📋 Orders table columns:');
        columns.forEach(col => console.log(`   - ${col.Field} (${col.Type})`));

        // Check for any orders with scheduled delivery dates or status
        const [ordersWithScheduled] = await connection.execute(
            'SELECT id, order_number, status, scheduled_delivery_date FROM orders WHERE scheduled_delivery_date IS NOT NULL'
        );
        
        if (ordersWithScheduled.length > 0) {
            console.log('\n📦 Orders with scheduled delivery dates:', ordersWithScheduled);
            
            // Clear scheduled delivery dates
            await connection.execute(
                'UPDATE orders SET scheduled_delivery_date = NULL WHERE scheduled_delivery_date IS NOT NULL'
            );
            console.log('✅ Cleared scheduled delivery dates from orders');
        } else {
            console.log('✅ No orders with scheduled delivery dates found');
        }

        // Check custom orders table
        const [customColumns] = await connection.execute('DESCRIBE custom_orders');
        console.log('\n📋 Custom orders table columns:');
        customColumns.forEach(col => console.log(`   - ${col.Field} (${col.Type})`));

        // Check for delivery-related fields in custom orders
        const hasDeliveryStatus = customColumns.some(col => col.Field === 'delivery_status');
        
        if (hasDeliveryStatus) {
            const [customOrdersWithDelivery] = await connection.execute(
                'SELECT id, custom_order_id, delivery_status FROM custom_orders WHERE delivery_status IS NOT NULL'
            );
            
            if (customOrdersWithDelivery.length > 0) {
                console.log('\n🎨 Custom orders with delivery status:', customOrdersWithDelivery);
                
                // Clear delivery status from custom orders
                await connection.execute(
                    'UPDATE custom_orders SET delivery_status = NULL WHERE delivery_status IS NOT NULL'
                );
                console.log('✅ Cleared delivery status from custom orders');
            }
        }

        // Final verification - check if delivery_schedules is really empty
        const [remainingSchedules] = await connection.execute('SELECT COUNT(*) as count FROM delivery_schedules');
        console.log(`\n📊 Final check - remaining delivery schedules: ${remainingSchedules[0].count}`);

        console.log('\n🎉 Calendar cleanup complete! The delivery calendar should now be empty.');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await connection.end();
    }
}

checkAndClearOrders();
