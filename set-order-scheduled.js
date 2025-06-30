const mysql = require('mysql2/promise');

async function setOrderToScheduled() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 's3v3n-f0ur-cl0thing*',
        database: 'seven_four_clothing'
    });

    try {
        console.log('=== SETTING ORDER TO SCHEDULED STATUS ===\n');

        // Update the delivery schedule to "scheduled" status
        const customOrderId = 3; // Our test order
        
        console.log(`📅 Setting custom order ${customOrderId} to 'scheduled' status...`);
        
        await connection.execute(`
            UPDATE delivery_schedules_enhanced 
            SET delivery_status = 'scheduled'
            WHERE order_id = ? AND order_type = 'custom_order'
        `, [customOrderId]);

        // Also update the custom_orders table for consistency
        await connection.execute(`
            UPDATE custom_orders 
            SET delivery_status = 'scheduled'
            WHERE id = ?
        `, [customOrderId]);

        // Verify the update
        const [verifySchedule] = await connection.execute(`
            SELECT id, order_id, order_type, delivery_status, delivery_date
            FROM delivery_schedules_enhanced 
            WHERE order_id = ? AND order_type = 'custom_order'
        `, [customOrderId]);

        const [verifyCustomOrder] = await connection.execute(`
            SELECT id, custom_order_id, status, delivery_status, customer_name
            FROM custom_orders WHERE id = ?
        `, [customOrderId]);

        if (verifySchedule.length > 0 && verifyCustomOrder.length > 0) {
            const schedule = verifySchedule[0];
            const customOrder = verifyCustomOrder[0];
            
            console.log('\n✅ UPDATE COMPLETE - VERIFICATION:');
            console.log(`📅 Delivery Schedule: ID ${schedule.id}`);
            console.log(`  - Order ID: ${schedule.order_id}`);
            console.log(`  - Order Type: ${schedule.order_type}`);
            console.log(`  - Delivery Status: ${schedule.delivery_status}`);
            console.log(`  - Delivery Date: ${schedule.delivery_date}`);
            
            console.log(`🎨 Custom Order: ${customOrder.custom_order_id}`);
            console.log(`  - Status: ${customOrder.status}`);
            console.log(`  - Delivery Status: ${customOrder.delivery_status}`);
            console.log(`  - Customer: ${customOrder.customer_name}`);
            
            if (schedule.delivery_status === 'scheduled') {
                console.log('\n🧪 READY FOR DELIVERED BUTTON TEST:');
                console.log('1. The custom order should now appear as "scheduled" in the frontend');
                console.log('2. "Delivered" button should be visible and clickable');
                console.log('3. "In Transit" button should also be visible');
                console.log('4. Test clicking "Delivered" to complete the delivery flow');
            } else {
                console.log('\n❌ Status update failed');
            }
        } else {
            console.log('❌ Verification failed - order or schedule not found');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await connection.end();
    }
}

setOrderToScheduled();
