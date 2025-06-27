const mysql = require('mysql2/promise');

async function finalCleanup() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 's3v3n-f0ur-cl0thing*',
        database: 'seven_four_clothing'
    });

    try {
        console.log('🔍 Final cleanup of all delivery-related data...');

        // Check orders with delivery_date
        const [ordersWithDelivery] = await connection.execute(
            'SELECT id, order_number, status, delivery_date FROM orders WHERE delivery_date IS NOT NULL'
        );
        
        if (ordersWithDelivery.length > 0) {
            console.log('\n📦 Orders with delivery dates:', ordersWithDelivery);
            
            // Clear delivery dates from orders
            await connection.execute('UPDATE orders SET delivery_date = NULL WHERE delivery_date IS NOT NULL');
            console.log('✅ Cleared delivery dates from orders');
        } else {
            console.log('✅ No orders with delivery dates found');
        }

        // Check if there are any orders with 'scheduled' or 'shipped' status that might show on calendar
        const [pendingOrders] = await connection.execute(
            'SELECT id, order_number, status FROM orders WHERE status IN ("processing", "shipped")'
        );
        
        if (pendingOrders.length > 0) {
            console.log('\n📋 Orders with processing/shipped status:', pendingOrders);
            console.log('   These might appear on calendar - consider setting to "confirmed" if needed');
        }

        // Check custom orders table for delivery-related fields
        try {
            const [customOrders] = await connection.execute('SELECT id, custom_order_id, status FROM custom_orders');
            console.log(`\n🎨 Custom orders found: ${customOrders.length}`);
            
            // If there are delivery-related columns, clear them
            try {
                await connection.execute('UPDATE custom_orders SET delivery_status = NULL WHERE delivery_status IS NOT NULL');
                console.log('✅ Cleared delivery status from custom orders');
            } catch (err) {
                // Column doesn't exist, which is fine
                console.log('ℹ️ No delivery_status column in custom_orders (expected)');
            }
        } catch (err) {
            console.log('ℹ️ Custom orders table structure checked');
        }

        // Final verification
        const [scheduleCount] = await connection.execute('SELECT COUNT(*) as count FROM delivery_schedules');
        const [orderDeliveryCount] = await connection.execute('SELECT COUNT(*) as count FROM orders WHERE delivery_date IS NOT NULL');
        
        console.log('\n📊 Final Status:');
        console.log(`   - Delivery schedules: ${scheduleCount[0].count}`);
        console.log(`   - Orders with delivery dates: ${orderDeliveryCount[0].count}`);
        
        if (scheduleCount[0].count === 0 && orderDeliveryCount[0].count === 0) {
            console.log('\n🎉 SUCCESS: Calendar is now completely empty!');
            console.log('   - No delivery schedules');
            console.log('   - No delivery dates on orders');
            console.log('   - The delivery calendar should show no pending deliveries');
        } else {
            console.log('\n⚠️ Some delivery data still remains - check the details above');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await connection.end();
    }
}

finalCleanup();
